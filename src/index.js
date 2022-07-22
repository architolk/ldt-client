import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";

function component() {
  const element = document.createElement('div');

  element.innerHTML = 'Results from the SPARQL query:';

  return element;
}

function printData(table, bindings) {
  const row = table.insertRow();

  for (const variable in bindings) {
    const cell = row.insertCell();
    cell.innerHTML = bindings[variable].value;
  }
}

function printHeader(table, variables) {
  const head = table.createTHead();
  const row = head.insertRow();
  variables.forEach( function (variable) {
    const cell = row.appendChild(document.createElement("th"));
    cell.innerHTML = variable.value;
  })
}

async function fetchData() {

  const myFetcher = new SparqlEndpointFetcher();

  const bindingsStream = await myFetcher.fetchBindings('https://dbpedia.org/sparql', 'SELECT * WHERE { ?s ?p ?o } LIMIT 100');
  bindingsStream.on('variables', (variables) => printHeader(table, variables));
  bindingsStream.on('data', (bindings) => printData(table, bindings));
}

document.body.appendChild(component());

const table = document.createElement('table');
document.body.appendChild(table);

fetchData(table);
