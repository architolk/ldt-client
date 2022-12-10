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
