/*
import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";
import * as endpointModule from "./endpoint.js";
import * as helperModule from "./helpers.js";
import graphlib from 'graphlib';
import dagre from 'dagre';
import * as joint from "jointjs";

export async function createDiagram(canvas, query, params) {
  var namespace = joint.shapes;

  var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

  var items = new Map(); // Items temporarily stored items that cannot be rendered yet to the graph

  var paper = new joint.dia.Paper({
      el: canvas,
      model: graph,
      gridSize: 10,
      drawGrid: false,
      width: '100%',
      height: '100%',
      cellViewNamespace: namespace
  });

  const myFetcher = new SparqlEndpointFetcher();
  const tripleStream = await myFetcher.fetchTriples(endpointModule.getEndpoint(), helperModule.replace(query,params));
  tripleStream.on('data', (triple) => addTripleToGraph(paper.getComputedSize(), graph, items, triple));

}

function layoutDiagram(size,graph) {
  var graphbox = joint.layout.DirectedGraph.layout(graph,{dagre: dagre, graphlib: graphlib, nodeSep: 30, edgeSep: 20, rankDir: "LR"});

  //Layout diagram in the middle of the canvas
  const xdiv = (size.width - graphbox.width) / 2;
  const ydiv = (size.height - graphbox.height) / 2;
  graph.getCells().forEach(cell => {
    cell.translate(xdiv,ydiv);
  });
}

function addTripleToGraph(size, graph, items, triple) {
  if (triple._predicate.value=='urn:dia:classname') {
    const classShape = addClassToGraph(graph,triple._subject.value);
    classShape.set("name",triple._object.value);
  } else if (triple._predicate.value=='urn:dia:attribute') {
    const classShape = addClassToGraph(graph,triple._subject.value);
    const arr = [];
    var notInserted = true;
    classShape.get("attributes").forEach(attr => {
      if (attr<triple.object.value) {
        arr.push(attr);
      } else {
        if (notInserted) {
          arr.push(triple._object.value);
          notInserted = false
        }
        arr.push(attr);
      }
    });
    if (notInserted) {
      arr.push(triple._object.value);
    }

    classShape.set("attributes",arr);
    classShape.resize(100,50+12*arr.length); //Hacky! Better is to use the real dimensions and not a value of the size of an attribute!
  } else if (triple._predicate.value=='urn:dia:relname') {
    addLinkToGraph(graph,items,triple);
  } else if (triple._predicate.value=='urn:dia:source') {
    addLinkToGraph(graph,items,triple);
  } else if (triple._predicate.value=='urn:dia:target') {
    addLinkToGraph(graph,items,triple);
  } else {
    addTripleDirectlyToGraph(size,graph,triple);
  }
  layoutDiagram(size,graph);
}

function addLinkToGraph(graph,items,triple) {

  var link = items.get(triple._subject.value);
  if (!link) {
    link = new joint.shapes.standard.Link();
    link.router("manhattan",{padding:20});
    items.set(triple._subject.value,link);
  }
  if (triple._predicate.value=='urn:dia:relname') {
    link.labels([{attrs:{text:{text:uriToLabel(triple._object.value)}},position:{args:{keepGradient:true}}}]);
  } else if (triple._predicate.value=='urn:dia:source') {
    const source = addClassToGraph(graph,triple._object.value);
    link.source(source);
  } else if (triple._predicate.value=='urn:dia:target') {
    const target = addClassToGraph(graph,triple._object.value);
    link.target(target);
  }
  //Only add the link to the graph if at least a source and target are defined
  if (link.source() && link.target()) {
    link.addTo(graph);
  }
}

function addTripleDirectlyToGraph(size, graph,triple) {

  const subjectShape = addShapeToGraph(graph,triple._subject.value);
  const objectShape = addShapeToGraph(graph,triple._object.value);

  const link = new joint.shapes.standard.Link();
  link.source(subjectShape);
  link.target(objectShape);
  link.router("manhattan",{padding:20});
  link.labels([{attrs:{text:{text:uriToLabel(triple._predicate.value)}},position:{args:{keepGradient:true}}}]);
  link.addTo(graph);
}

function uriToLabel(uri) {
  return uri.replace(/^.*(\/|#)([a-zA-Z0-9]+)$/,"$2")
}

function addClassToGraph(graph,uri) {

  var shape = graph.getCell(uri);
  if (!shape) {
    var shape = new joint.shapes.uml.Class({
      size: {width: 100, height: 50},
      attributes: [],
      id: uri
    });
    shape.addTo(graph);
  }
  return shape
}

function addShapeToGraph(graph,uri) {

  var shape = graph.getCell(uri);
  if (!shape) {
    var shape = new joint.shapes.standard.Ellipse();
    shape.resize(100, 40);
    shape.set("id",uri);
    shape.attr({
        body: {
            fill: 'white'
        },
        label: {
            text: uriToLabel(uri),
            fill: 'black'
        }
    });
    shape.addTo(graph);
  }
  return shape
}
*/
