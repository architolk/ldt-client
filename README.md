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

- fetchData(DOMElement,query,params)
  - DOMElement: the table in which the data is presented.
  - query: SELECT-query string. May contain parameters, like `@GRAPH@`
  - parameters: JSON object containing parameters, for example: `{graph:'urn:foo'}`
- fetchTriples(DOMElement,query,params)
  - DOMElement: the table in which the data is presented.
  - query: CONSTRUCT-query string. May contain parameters, like `@URI@`
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
