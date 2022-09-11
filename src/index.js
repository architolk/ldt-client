import {SparqlEndpointFetcher} from "fetch-sparql-endpoint";

export function addNav(menu) {
  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-lg bg-light';
  var navhtml = `
  <div class="container-fluid">
    <a class="navbar-brand" href="#">LDT Client</a>
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
        cell.innerHTML = "<a href='nav_"+variable+".html?"+encodeURIComponent(binding.value)+"'>" + label + "</a>";
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
