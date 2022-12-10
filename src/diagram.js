import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";
import graphlib from 'graphlib';
import dagre from 'dagre';
import * as joint from "jointjs";

export async function createDiagram(canvas, query, params) {
  var namespace = joint.shapes;

  var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

  var paper = new joint.dia.Paper({
      el: canvas,
      model: graph,
      width: 900,
      height: 900,
      gridSize: 10,
      drawGrid: true,
      cellViewNamespace: namespace
  });

  const myFetcher = new SparqlEndpointFetcher();
  const tripleStream = await myFetcher.fetchTriples(endpointModule.getEndpoint(), helperModule.replace(query,params));
  tripleStream.on('data', (triple) => addTripleToGraph(graph, triple));

}

function addTripleToGraph(graph,triple) {

  const subjectShape = addShapeToGraph(graph,triple._subject.value);
  const objectShape = addShapeToGraph(graph,triple._object.value);

  const link = new joint.shapes.standard.Link();
  link.source(subjectShape);
  link.target(objectShape);
  link.router("manhattan",{padding:20});
  link.labels([{attrs:{text:{text:uriToLabel(triple._predicate.value)}},position:{args:{keepGradient:true}}}]);
  link.addTo(graph);

  var graphbox = joint.layout.DirectedGraph.layout(graph,{dagre: dagre, graphlib: graphlib, nodeSep: 20, edgeSep: 20, rankDir: "LR"});

}

function uriToLabel(uri) {
  return uri.replace(/^.*(\/|#)([a-zA-Z0-9]+)$/,"$2")
}

function addShapeToGraph(graph,uri) {

  var shape = graph.getCell(uri);
  if (!shape) {
    var shape = new joint.shapes.standard.Rectangle();
    shape.position(100, 30);
    shape.resize(100, 40);
    shape.set("id",uri);
    shape.attr({
        body: {
            fill: 'blue'
        },
        label: {
            text: uriToLabel(uri),
            fill: 'white'
        }
    });
    shape.addTo(graph);
  }
  return shape
}
