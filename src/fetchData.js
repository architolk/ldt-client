import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";

var _enableLinkCallback = false;

export function enableLinkCallback(enable) {
  _enableLinkCallback = enable;
}

export async function fetchData(table, query, params) {
  showSpinner(table);
  const myFetcher = new SparqlEndpointFetcher();
  const bindingsStream = await myFetcher.fetchBindings(endpointModule.getEndpoint(), helperModule.replace(query,params));
  bindingsStream.on('variables', (variables) => printHeader(table, variables));
  bindingsStream.on('data', (bindings) => printData(table, bindings));
}

function showSpinner(table) {
  table.spinnerShowing = true;
  table.innerHTML = "<div class='d-flex justify-content-center'><div class='spinner-border m-5' role='status'></div></div>";
}

function removeSpinner(table) {
  if (table.spinnerShowing) {
    table.spinnerShowing = false;
    table.innerHTML = "";
  }
}

function printHeader(table, variables) {
  removeSpinner(table);
  const head = table.createTHead();
  const row = head.insertRow();
  table.dataColumns = [];
  variables.forEach( function (variable) {
    if ((!variable.value.match(/_label$/)) && (!variable.value.match(/_graph$/)) && (!variable.value.match(/_link$/)) && (!variable.value.match(/_glink$/))) {
      const cell = row.appendChild(document.createElement("th"));
      cell.innerHTML = variable.value;
      table.dataColumns.push(variable.value);
    }
  })
}

function printData(table, bindings) {
  removeSpinner(table);
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
        const glinkBinding = bindings[variable+"_glink"];
        if (glinkBinding) {
          cell.innerHTML = "<a href='"+glinkBinding.value+"' target='_blank'>" + label + "</a>";
        } else {
          const linkBinding = bindings[variable+"_link"];
          var link = variable;
          if (linkBinding) {
            link = linkBinding.value;
          }
          var graphbinding = bindings[variable+"_graph"];
          if (!graphbinding) {
            graphbinding = bindings["_graph"];
          }
          var querybinding = bindings[variable+"_query"];
          if (!querybinding) {
            querybinding = bindings["_query"];
          }
          if (!_enableLinkCallback) {
            const graphstr = (graphbinding ? "graph="+encodeURIComponent(graphbinding.value)+"&" : "");
            const querystr = (querybinding ? "query="+encodeURIComponent(querybinding.value)+"&" : "");
            cell.innerHTML = "<a href='nav_"+link+".html?"+graphstr+querystr+"uri="+encodeURIComponent(binding.value)+"'>" + label + "</a>";
          } else {
            const graphstr = (graphbinding ? graphbinding.value : "");
            const querystr = (querybinding ? querybinding.value : "");
            cell.innerHTML = "<a href='#' rel='link_callback' href='#' onclick='link_callback()' data-link='nav_"
                  +link+"' data-graphuri='"+graphstr+querystr+"' data-subjecturi='"+binding.value+"'>" + label + "</a>"

          }
        }
      } else {
        cell.innerHTML = binding.value;
      }
    }
  })
}
