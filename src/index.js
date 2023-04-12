import * as fetchDataModule from './fetchData.js';
import * as endpointModule from './endpoint.js';
import * as fetchValueModule from './fetchValue.js';
import * as navModule from './nav.js';
import * as fetchTriplesModule from './fetchTriples.js';
import * as fetchTreeModule from './fetchTree.js';
//import * as diagramModule from './diagram.js';

export function addNav(title, menu) {
  navModule.addNav(title,menu)
}

export function setEndpoint(_endpoint) {
  endpointModule.setEndpoint(_endpoint)
}

export async function fetchValue(value, query, params, callback) {
  fetchValueModule.fetchValue(value,query,params,callback)
}

export async function fetchData(table, query, params) {
  fetchDataModule.fetchData(table,query,params)
}

export async function fetchTriples(table, query, params) {
  fetchTriplesModule.fetchTriples(table,query,params)
}

export async function fetchTree(tree, table, query, params) {
  fetchTreeModule.fetchTree(tree,table,query,params)
}

/*
export async function createDiagram(canvas, query, params) {
  diagramModule.createDiagram(canvas,query,params)
}
*/
