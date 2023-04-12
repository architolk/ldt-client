# ldt-client
The Linked Data Theatre from the client, using rdfjs

## Running

```
git clone git@github.com:architolk/ldt-client.git
cd ldt-client
npm install
npm start
```

## Building

Change mode in `webpack.config.js` to 'production', and do:

```
npm run build
```

Copy all files from the [/dist](dist) folder (after the build is completed) to the webserver of your choice

## Usage

### Simple table (select routine)

- `_label` for labels of URI
- `_graph` for graph of URI
- `_link` for link to URI

### Simple form (construct routine)

- `rdfs:label` used for label of URI
- `<urn:ldt:graph>` used for graph of URI
- `<urn:ldt:link>` used for link to URI

### Tree view

## API

- fetchValue(value,query,params,callback)
  - value: the value that is returned to the callback OR `null`, in which case the query is executed to fetch the value
  - query: SELECT-query string. May contain parameters, like `@GRAPH@`
  - parameters: JSON object containing parameters, for example: `{graph:'urn:foo'}`
  - callback: a function with one parameter that will contain the value, typically something like: `(value) => {console.log(value)}`
- fetchData(DOMElement,query,params)
  - DOMElement: the table in which the data is presented.
  - query: SELECT-query string. May contain parameters, like `@GRAPH@`
  - parameters: JSON object containing parameters, for example: `{graph:'urn:foo'}`
- fetchTriples(DOMElement,query,params)
  - DOMElement: the table in which the data is presented.
  - query: CONSTRUCT-query string. May contain parameters, like `@URI@`
    - a triple with predicate `urn:ldt:link` can be used for an alternative href for the object (default is the predicate localname of the original triple)
    - a triple with predicate `urn:ldt:graph` can be used for an alternative graph reference (default is the graph of the whole form)
  - parameters: JSON object containing parameters, for example: `{uri:'urn:foo'}`
    - The `uri` parameter is mandatory (this is the subject of the table)
    - A parameter `label` might contain the label of the subject
- fetchTree(DOMElement-tree,DOMElement-table,query,params)
  - DOMElement-tree: the tree in which the data is presented.
  - DOMElement-table: the table in which the data is presented (after a node in the tree is selected)
  - query: CONSTRUCT-query string. Used for a fetchTriples within the tree. Should have a `@URI@` parameter
  - parameters: JSON object containing parameters, for example: `{uri:'urn:foo'}`
    - a parameter `label` is used for the label in the tree, default is `rdfs:label`
    - a parameter `upper` is used for the property higher in the tree
    - a parameter `lower` is used for the property lower in the tree (one of these should be present)
    - a parameter `class` can be used to filter the objects in the list
    - a parameter `types` can be used to create subtrees per type. This is an array of classes that are use for each individual subtree.
    - a parameter `uri` can be used for the top element of the tree. If no uri is given, all elements without a parent are shown in te tree.
- createDiagram(DOMElement,query,parameter)
  - DOMElement: the canvas to draw the diagram on. The canvas will be the full width and height of the parent DOM element.
  - query: CONSTRUCT query to create the diagram elements. Diagram elements will be placed in the middle of the canvas.
    - By default any subject or object is displayed as an ellipse (using the localname as label) and any predicate as a link
    - A predicate `urn:dia:classname` can be used to display a class rectangle with the corresponding name
    - A predicate `urn:dia:attribute` can be used to display an attribute in a class rectangle
    - A predicate `urn:dia:relname` can be used to display a link with the corresponding name
    - A predicate `urn:dia:source` can be used to set the source of the link
    - A predicate `urn:dia:target` can be used to set the target of the link
  - parameters: JSON object containing parameters, for example `{graph:'urn:foo'}`
