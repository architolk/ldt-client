import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";

const labels = new Map();

export function addNav(title, menu) {
  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-lg bg-light';
  var navhtml = `
  <div class="container-fluid">
    <a class="navbar-brand" href="#">` + title + `</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
  `;
  for (const item in menu) {
    navhtml = navhtml + '<li class="nav-item"><a class="nav-link" href="' + menu[item].toLowerCase() + '.html">' + menu[item] + '</a></li>\n';
  }
  nav.innerHTML = navhtml + `
      </ul>
      <form class="d-flex" role="search" action="search.html">
        <input class="form-control me-2" name="term" type="search" placeholder="Zoeken" aria-label="Zoeken">
        <button class="btn btn-outline-success" type="submit">Zoeken</button>
      </form>
    </div>
  </div>
  `;
  document.body.appendChild(nav);
}

function printTriple(table, subject, triple) {
  if (triple._subject.value == subject) {
    var row = document.getElementById(triple._predicate.value);
    var keyterm = labels.get(triple._predicate.value);
    if (!keyterm) {
      keyterm = triple._predicate.value.replace(/^.+(#|\/)(.+)$/,"$2");
    }
    if (row) {
      const valuecell = row.childNodes[1];
      if (triple._object.termType == 'NamedNode') {
        var olabel = labels.get(triple._object.value);
        if (!olabel) {
          olabel = triple._object.value;
        }
        valuecell.innerHTML = valuecell.innerHTML + ", " + "<a name='"+triple._object.value+"' href='nav_"+keyterm+".html?uri="+encodeURIComponent(triple._object.value)+"'>" + olabel + "</a>";
      } else {
        valuecell.innerHTML = valuecell.innerHTML + ", " + triple._object.value;
      }
    } else {
      row = table.insertRow();
      row.id = triple._predicate.value;
      const keycell = row.insertCell();
      keycell.innerHTML = keyterm;
      const valuecell = row.insertCell();
      if (triple._object.termType == 'NamedNode') {
        var olabel = labels.get(triple._object.value);
        if (!olabel) {
          olabel = triple._object.value;
        }
        valuecell.innerHTML = "<a name='"+triple._object.value+"' href='nav_"+keyterm+".html?uri="+encodeURIComponent(triple._object.value)+"'>" + olabel + "</a>";
      } else {
        valuecell.innerHTML = triple._object.value;
      }
    }
  }
  if (triple._predicate.value=="http://www.w3.org/2000/01/rdf-schema#label") {
    var row = document.getElementById(triple._subject.value);
    if (row) {
      row.childNodes[0].innerHTML = triple._object.value;
    }
    const objects = document.getElementsByName(triple._subject.value);
    objects.forEach((obj) => {
      obj.innerHTML = triple._object.value;
    });
    //Add to map for further reference
    labels.set(triple._subject.value,triple._object.value);
  }
}

function printData(table, bindings) {
  const row = table.insertRow();

  for (const variable in bindings) {
    if (!variable.match(/_label$/)) {
      const cell = row.insertCell();
      const binding = bindings[variable];
      if (binding.termType=='NamedNode') {
        const labelBinding = bindings[variable+"_label"];
        var label = binding.value;
        if (labelBinding) {
          label = labelBinding.value;
        }
        cell.innerHTML = "<a href='nav_"+variable+".html?uri="+encodeURIComponent(binding.value)+"'>" + label + "</a>";
      } else {
        cell.innerHTML = binding.value;
      }
    }
  }
}

function printHeader(table, variables) {
  const head = table.createTHead();
  const row = head.insertRow();
  variables.forEach( function (variable) {
    if (!variable.value.match(/_label$/)) {
      const cell = row.appendChild(document.createElement("th"));
      cell.innerHTML = variable.value;
    }
  })
}

var endpoint = "";

export function setEndpoint(_endpoint) {
  endpoint = _endpoint;
}

export async function fetchData(table, query) {

  const myFetcher = new SparqlEndpointFetcher();

  const bindingsStream = await myFetcher.fetchBindings(endpoint, query);
  bindingsStream.on('variables', (variables) => printHeader(table, variables));
  bindingsStream.on('data', (bindings) => printData(table, bindings));
}

export async function fetchTriples(table, subject, query) {

  const myFetcher = new SparqlEndpointFetcher();
  const tripleStream = await myFetcher.fetchTriples(endpoint, query);
  tripleStream.on('data', (triple) => printTriple(table, subject, triple));
}
