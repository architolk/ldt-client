import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as fetchTriplesModule from './fetchTriples.js';

export async function fetchTree(tree, table, query, params) {

  if (params.types) {
    params.types.forEach((type) => {
      const li = document.createElement('li');
      tree.appendChild(li);
      const details = document.createElement('details');
      li.appendChild(details);
      const summary = document.createElement('summary');
      details.appendChild(summary);
      summary.innerHTML = type.replace(/^.+(#|\/)(.+)$/,"$2");
      //We need to transfer the context (table, query, params) to the subtree, because actions on the tree cannot use the context via the async functions
      li.tablelink = table;
      li.query = query;
      li.params = Object.assign({},params); //Copy of the params, because they will change per li
      li.params.class = type; //Assign the type to the class, so the subtree will only have elements of this class
      //Make sure that the context is available in details
      details.treelink = li;
      details.onclick = function () {
        const ul = document.createElement('ul');
        this.appendChild(ul);
        this.onclick = null; //Only ones, the branch is loaded after the first call
        this.treelink.params.uri = this.uri; //Transfer URI context to params
        fetchBranch(this.treelink,ul);
      }
    });
  } else {
    //We need to transfer the context (table, query, params) to the tree, because actions on the tree cannot use the context via the async functions
    tree.tablelink = table;
    tree.query = query;
    tree.params = params;
    fetchBranch(tree, tree);
  }
}

async function fetchBranch(tree, branch) {

  const myFetcher = new SparqlEndpointFetcher();
  const params = tree.params;
  const graphstr = (params.graph) ? "GRAPH <"+params.graph+">" : "";
  const typestr = (params.class) ? "?uri a <"+params.class+">." : "";
  const ptypestr = (params.class) ? "?p a <"+params.class+">." : "";
  const labelstr = (params.label) ? "?uri <"+params.label+"> ?lbl." : "?uri <http://www.w3.org/2000/01/rdf-schema#label> ?lbl.";
  var parentstr = "";
  var childrenstr = "";
  if (params.upper) {
    parentstr = (params.uri) ? "?uri <"+params.upper+"> <"+params.uri+">." : "?uri <"+params.upper+"> ?p.";
    childrenstr = "?c <"+params.upper+"> ?uri.";
  } else {
    if (params.lower) {
      parentstr = (params.uri)? "<"+params.uri+"> <"+params.lower+"> ?uri." : "?p <"+params.lower+"> ?uri.";
      childrenstr = "?uri <"+params.lower+"> ?c.";
    }
  }
  if ((parentstr!="") && (childrenstr!="")) {
    const treeQuery = (params.uri)
      ? "SELECT ?uri (min(?lbl) as ?label) (count(distinct ?c) as ?count) WHERE {"+graphstr+"{"+parentstr+labelstr+" OPTIONAL {"+childrenstr+"}}} GROUP BY ?uri ORDER BY ?label"
      : "SELECT ?uri (min(?lbl) as ?label) (count(distinct ?c) as ?count) WHERE {"+graphstr+"{"+typestr+labelstr+"FILTER NOT EXISTS {"+parentstr+"} OPTIONAL {"+childrenstr+"}}} GROUP BY ?uri ORDER BY ?label";
    const bindingsStream = await myFetcher.fetchBindings(endpointModule.getEndpoint(), treeQuery);

    bindingsStream.on('data', (bindings) => printTripleInTree(tree,branch,bindings));
  }
}

function addAnchor(parent,tree,bindings,count) {
  const anchor = document.createElement("a");
  parent.appendChild(anchor);
  anchor.href="#";
  anchor.innerHTML = bindings['label'].value + (count>0 ? " (" + count + ")" : "");
  if (tree.tablelink) {
    anchor.uri = bindings['uri'].value;
    anchor.treelink = tree;
    anchor.onclick = function () {
      this.treelink.tablelink.innerHTML="";
      this.treelink.params.uri = this.uri; //Transfer URI context to params
      fetchTriplesModule.fetchTriples(this.treelink.tablelink,this.treelink.query,this.treelink.params);
    }
  }
}

function printTripleInTree(tree, branch, bindings) {
  const li = document.createElement('li');
  var count = bindings['count'].value;
  branch.appendChild(li);
  if (count==0) {
    addAnchor(li,tree,bindings,count);
  } else {
    const details = document.createElement('details');
    li.appendChild(details);
    const summary = document.createElement('summary');
    details.appendChild(summary);
    addAnchor(summary,tree,bindings,count);
    //Make sure that the context is available in details
    details.uri = bindings['uri'].value;
    details.treelink = tree;
    details.onclick = function () {
      const ul = document.createElement('ul');
      this.appendChild(ul);
      this.onclick = null; //Only ones, the branch is loaded after the first call
      this.treelink.params.uri = this.uri; //Transfer URI context to params
      fetchBranch(this.treelink,ul);
    }
  }
}
