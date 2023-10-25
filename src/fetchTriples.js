import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";

const labels = new Map();
const links = new Map();
const glinks = new Map();
const graphs = new Map();

const FullURLRegex = new RegExp("^[http|https]");

var _enableLinkCallback = false;

export function enableLinkCallback(enable) {
  _enableLinkCallback = enable;
}

function emptyGlobals() {
  //Single page applications might falsly retain values in the global variables
  //So we need to empty these globals - just to be sure!
  labels.clear();
  links.clear();
  glinks.clear();
  graphs.clear();
}

function printHeader(table,title) {
  if (title) {
    if (!table.tHead) {
      const head = table.createTHead();
      const row = head.insertRow();
      const cell = row.appendChild(document.createElement("th"));
      cell.colSpan = "2";
      cell.innerHTML = title;
    }
  }
}

function getLinkParams(uri,link,graph) {
  var glink = glinks.get(uri);
  if (glink) {
    return {link: glink}; //When a global link exists, override the local link
  } else {
    var olink = links.get(uri); //By default the link is the predicate, but if defined otherwise, use defined link
    if (!olink) {
      olink = link
    }
    var ograph = graphs.get(uri); //By default the graph is the given graph, but if defined otherwise, use defined graph
    if (!ograph) {
      ograph = graph;
    }
    return {uri: uri, link: olink, graph: ograph}
  }
}

function getHRef(uri,link,graph) {
  const linkParams = getLinkParams(uri,link,graph);
  if (linkParams.uri) {
    const graphstr = ((linkParams.graph) ? "graph="+encodeURIComponent(linkParams.graph)+"&" : "");
    return "nav_"+linkParams.link+".html?"+graphstr+"uri="+encodeURIComponent(linkParams.uri)
  } else {
    return linkParams.link
  }
}

function getValue(object,link,graph) {
  if (object.termType == 'NamedNode') {
    var olabel = labels.get(object.value);
    if (!olabel) {
      olabel = object.value;
    }
    if (!_enableLinkCallback) {
      const href = getHRef(object.value,link,graph);
      const targetwin = ((FullURLRegex.test(href)) ? " target='_blank'" : "");
      return "<a name='"+object.value+"' href='"+href+"'"+targetwin+">" + olabel + "</a>"
    } else {
      const linkParams = getLinkParams(object.value,link,graph);
      const graphstr = ((linkParams.graph) ? linkParams.graph : "");
      return "<a name='"+object.value+"' rel='link_callback' href='#' onclick='link_callback()' data-link='nav_"
            +linkParams.link+"' data-graphuri='"+graphstr+"' data-subjecturi='"+linkParams.uri+"'>" + olabel + "</a>"
    }
  } else {
    return object.value
  }
}

export async function fetchTriples(table, query, params) {

  if (params) {
    emptyGlobals();
    printHeader(table,params.label);

    if (params.uri) {
      const myFetcher = new SparqlEndpointFetcher();
      const tripleStream = await myFetcher.fetchTriples(endpointModule.getEndpoint(), helperModule.replace(query,params));
      tripleStream.on('data', (triple) => printTriple(table, triple, params));
    } else {
      console.log("Error: no URI-parameter")
    }
  } else {
    console.log("Error: no params (at least a URI-parameter should be present)")
  }

}

function printTriple(table, triple, params) {
  // The 'special' predicates will be ignored, even if its subject is the one we are looking for
  if (triple._predicate.value=="urn:ldt:link") {
    const objects = document.getElementsByName(triple._subject.value); //All anchors (<a href>) to a particular uri
    objects.forEach((obj) => {
      if (!_enableLinkCallback) {
        obj.href = getHRef(triple._subject.value,triple._object.value,params.graph); //Change the label of the link to the actual label of the link-uri
      } else {
        obj.setAttribute('data-link',"nav_" + triple._object.value);
      }
    });
    //Add to map for further reference (so we will directly use the correct link, instead of the predicate)
    links.set(triple._subject.value,triple._object.value);
  } else if (triple._predicate.value=="urn:ldt:glink") {
    //Add to map for further reference (so we will directly use the correct global link, instead of the predicate)
    glinks.set(triple._subject.value,triple._object.value);
    const objects = document.getElementsByName(triple._subject.value); //All anchors (<a href>) to a particular uri
    objects.forEach((obj) => {
      if (!_enableLinkCallback) {
        const href = getHRef(triple._subject.value,null,params.graph);
        obj.href =  href; //Change the the link to the actual link-uri (original link won't matter)
        if (FullURLRegex.test(href)) {
          obj.target = '_blank'
        }
      } else {
        obj.setAttribute('data-link',triple._object.value);
      }
    });
  } else if (triple._predicate.value=="urn:ldt:graph") {
    const objects = document.getElementsByName(triple._subject.value); //All anchors (<a href>) to a particular uri
    objects.forEach((obj) => {
      if (!_enableLinkCallback) {
        const olink = obj.href.replace(/^.*nav_(.+).html.*$/,"$1"); //Specific case: we need to find the original link again...
        obj.href = getHRef(triple._subject.value,olink,triple._object.value); //Change the graph of the link to the actual graph of the uri
      } else {
        obj.setAttribute('data-graphuri',triple._object.value);
      }
    });
    //Add to map for further reference (so we will directly use the correct graph, instead of the param graph)
    graphs.set(triple._subject.value,triple._object.value);
  } else if (triple._subject.value == params.uri) { //We will only print triples for the selected subject, all other triples are used for other purposes (like labes of objects)
    if (triple._predicate.value == "http://www.w3.org/2000/01/rdf-schema#label") {
      printHeader(table,triple._object.value)
    }
    var row = document.getElementById(triple._predicate.value); //A row corresponds to a predicate
    var keycode = triple._predicate.value.replace(/^.+(#|\/)(.+)$/,"$2");
    var keyterm = labels.get(triple._predicate.value);
    if (!keyterm) {
      keyterm = keycode;
    }
    if (row) {
      const valuecell = row.childNodes[1];
      valuecell.innerHTML = valuecell.innerHTML + ", " + getValue(triple._object,keycode,params.graph);
    } else {
      var tbody;
      if (table.tBodies.length==0) {
        tbody = table.createTBody();
      } else {
        tbody = table.tBodies[0];
      }
      row = tbody.insertRow();
      row.id = triple._predicate.value;
      const keycell = row.insertCell();
      const plabel = labels.get(triple._predicate.value);
      if (plabel) {
        keycell.innerHTML = plabel //set the label of the predicate to the previously found label
      } else {
        keycell.innerHTML = keyterm; //Label of the predicate is the localname of the prediate (at first)
      }
      const valuecell = row.insertCell();
      valuecell.innerHTML = getValue(triple._object,keycode,params.graph);
    }
  }
  //Process other triples that are found
  if (triple._predicate.value=="http://www.w3.org/2000/01/rdf-schema#label") {
    var row = document.getElementById(triple._subject.value); //A row corresponds to a predicate
    if (row) {
      row.childNodes[0].innerHTML = triple._object.value; //Label of the predicate is changed to its real label, when available
    }
    const objects = document.getElementsByName(triple._subject.value); //All anchors (<a href>) to a particular uri
    objects.forEach((obj) => {
      obj.innerHTML = triple._object.value; //Change the label of the link to the actual label of the uri
    });
    //Add to map for further reference (so we will directly use the correct label, instead of the uri itself)
    labels.set(triple._subject.value,triple._object.value);
  }
}
