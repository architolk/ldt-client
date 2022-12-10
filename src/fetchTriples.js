import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";

const labels = new Map();
const links = new Map();

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

function getHRef(uri,link,graph) {
  const graphstr = ((graph) ? "graph="+encodeURIComponent(graph)+"&" : "");
  return "nav_"+link+".html?"+graphstr+"uri="+encodeURIComponent(uri)
}

function getValue(object,link,graph) {
  if (object.termType == 'NamedNode') {
    var olabel = labels.get(object.value);
    if (!olabel) {
      olabel = object.value;
    }
    var olink = links.get(object.value); //By default the link is the predicate, but if defined otherwise, use defined link
    if (!olink) {
      olink = link;
    }
    const graphstr = ((graph) ? "graph="+encodeURIComponent(graph)+"&" : "");
    return "<a name='"+object.value+"' href='"+getHRef(object.value,olink,graph)+"'>" + olabel + "</a>"
  } else {
    return object.value
  }
}

export async function fetchTriples(table, query, params) {

  if (params) {
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
  //We will only print triples for the selected subject, all other triples are used for other purposes (like labes of objects)
  if (triple._subject.value == params.uri) {
    if (triple._predicate.value == "http://www.w3.org/2000/01/rdf-schema#label") {
      printHeader(table,triple._object.value)
    }
    var row = document.getElementById(triple._predicate.value); //A row corresponds to a predicate
    var keyterm = labels.get(triple._predicate.value);
    if (!keyterm) {
      keyterm = triple._predicate.value.replace(/^.+(#|\/)(.+)$/,"$2");
    }
    if (row) {
      const valuecell = row.childNodes[1];
      valuecell.innerHTML = valuecell.innerHTML + ", " + getValue(triple._object,keyterm,params.graph);
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
      valuecell.innerHTML = valuecell.innerHTML + ", " + getValue(triple._object,keyterm,params.graph);
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
  if (triple._predicate.value=="urn:ldt:link") {
    const objects = document.getElementsByName(triple._subject.value); //All anchors (<a href>) to a particular uri
    objects.forEach((obj) => {
      obj.href = getHRef(triple._subject.value,triple._object.value,params.graph); //Change the label of the link to the actual label of the uri
    });
    //Add to map for further reference (so we will directly use the correct link, instead of the predicate)
    links.set(triple._subject.value,triple._object.value);
  }
}
