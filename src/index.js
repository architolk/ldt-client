import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";

function component() {
  const element = document.createElement('div');

  element.innerHTML = 'Hello world!';

  return element;
}

async function fetchData() {

  const myFetcher = new SparqlEndpointFetcher();

  const bindingsStream = await myFetcher.fetchBindings('https://dbpedia.org/sparql', 'SELECT * WHERE { ?s ?p ?o } LIMIT 100');
  bindingsStream.on('data', (bindings) => console.log(bindings));

}

fetchData();

document.body.appendChild(component());
