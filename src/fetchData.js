import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";

export async function fetchData(table, query, params) {
  const myFetcher = new SparqlEndpointFetcher();
  const bindingsStream = await myFetcher.fetchBindings(endpointModule.getEndpoint(), helperModule.replace(query,params));
  bindingsStream.on('variables', (variables) => printHeader(table, variables));
  bindingsStream.on('data', (bindings) => printData(table, bindings));
}

function printHeader(table, variables) {
  const head = table.createTHead();
  const row = head.insertRow();
  table.dataColumns = [];
  variables.forEach( function (variable) {
    if ((!variable.value.match(/_label$/)) && (!variable.value.match(/_graph$/)) && (!variable.value.match(/_link$/))) {
      const cell = row.appendChild(document.createElement("th"));
      cell.innerHTML = variable.value;
      table.dataColumns.push(variable.value);
    }
  })
}

function printData(table, bindings) {
  var tbody;
  if (table.tBodies.length==0) {
    tbody = table.createTBody();
  } else {
    tbody = table.tBodies[0];
  }
  const row = tbody.insertRow();

  table.dataColumns.forEach( function (variable) {
    const cell = row.insertCell();
    const binding = bindings[variable];

    if (binding) {
      if (binding.termType=='NamedNode') {
        const labelBinding = bindings[variable+"_label"];
        var label = binding.value;
        if (labelBinding) {
          label = labelBinding.value;
        }
        const linkBinding = bindings[variable+"_link"];
        var link = variable;
        if (linkBinding) {
          link = linkBinding.value;
        }
        var graphbinding = bindings[variable+"_graph"];
        if (!graphbinding) {
          graphbinding = bindings["_graph"];
        }
        const graphstr = (graphbinding ? "graph="+encodeURIComponent(graphbinding.value)+"&" : "");
        cell.innerHTML = "<a href='nav_"+link+".html?"+graphstr+"uri="+encodeURIComponent(binding.value)+"'>" + label + "</a>";
      } else {
        cell.innerHTML = binding.value;
      }
    }
  })
}
