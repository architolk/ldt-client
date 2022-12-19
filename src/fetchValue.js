import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";

export async function fetchValue(value, query, params, callback) {

  if (value) {
    callback(value)
  } else {
    const myFetcher = new SparqlEndpointFetcher();
    const bindingsStream = await myFetcher.fetchBindings(endpointModule.getEndpoint(), helperModule.replace(query,params));
    bindingsStream.on('data', (bindings) => {
      callback(bindings[Object.keys(bindings)[0]].value) //Get first value of the SELECT-statement
    });
  }
}
