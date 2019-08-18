var appended = {
  scripts: [],
  styles: [],
  name: window.location.hash.slice(1) || "/"
};

// Application div
const appDiv = "app-root";

// Both set of different routes and template generation functions
let routes = {};
let templates = {};

// Register a template (this is to mimic a template engine)
let template = (name, templateFunction) => {
  return (templates[name] = templateFunction);
};

// Define the routes. Each route is described with a route path & a template to render
// when entering that path. A template can be a string (file name), or a function that
// will directly create the DOM objects.
let route = (path, template) => {
  if (typeof template == "function") {
    return (routes[path] = template);
  } else if (typeof template == "string") {
    return (routes[path] = templates[template]);
  } else {
    return;
  }
};

let callPage = (form_path, headfn, bodyfn, title, hash) => {
  let xhr = new XMLHttpRequest();

  xhr.responseType = "document";

  xhr.open("GET", form_path, true);

  xhr.onload = () => {
    if (xhr.status == 200) {
      body = new XMLSerializer().serializeToString(xhr.response.body);
      headXML = xhr.response.head;
      ap = headfn(headXML);
      appended.scripts = ap.scripts;
      appended.styles = ap.styles;
      bodyfn(body);
    }
  };

  xhr.send();
};

appendHead = headXML => {
  var ind = 0;
  var appended = {
    scripts: [],
    styles: []
  };
  var newElements = headXML.getElementsByTagName("script");
  var oldElements = document.getElementsByTagName("script");
  var can_be_appended = true;
  for (
    let newElement = 0; newElement - ind < newElements.length; newElement++
  ) {
    can_be_appended = true;
    for (let oldElement = 0; oldElement < oldElements.length; oldElement++) {
      if (newElements[newElement - ind].src === oldElements[oldElement].src) {
        can_be_appended = false;
        break;
      }
    }
    if (can_be_appended) {
      head = document.getElementsByTagName("head")[0];
      var ele = newElements[newElement - ind].src;
      newElements[newElement - ind].src = ele;
      appended.scripts.push(newElements[newElement - ind]);
      head.appendChild(newElements[newElement - ind]);

      ind++;
    }
  }

  var ind = 0;
  var newElements = headXML.getElementsByTagName("link");
  var oldElements = document.getElementsByTagName("link");
  var can_be_appended = true;
  for (
    let newElement = 0; newElement - ind < newElements.length; newElement++
  ) {
    can_be_appended = true;
    for (let oldElement = 0; oldElement < oldElements.length; oldElement++) {
      if (newElements[newElement - ind].href === oldElements[oldElement].href) {
        can_be_appended = false;
        break;
      }
    }

    if (can_be_appended) {
      head = document.getElementsByTagName("head")[0];
      var ele = newElements[newElement - ind].href;
      newElements[newElement - ind].href = ele;
      appended.styles.push(newElements[newElement - ind]);
      head.appendChild(newElements[newElement - ind]);

      ind++;
    }
  }
  return appended;
};

appendBody = bodyTXT => {
  document.getElementById(appDiv);
  let myDiv = document.getElementById(appDiv);
  myDiv.innerHTML = bodyTXT;
};

addPageTemp = (path, title, hash) => {
  template(title, () => {
    document.title = title;
    callPage(path, appendHead, appendBody, title, hash);
  });
  route("/" + hash, title);
};

let router = evt => {
  const url = window.location.hash.slice(1) || "/";

  if (appended.name !== url) {
    if (appended.scripts.length != 0) {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        for (var j = 0; j < appended.scripts.length; j++) {
          if (scripts[i].src == appended.scripts[j].src) {
            scripts[i].remove();
          }
        }
      }
    }
    if (appended.styles.length != 0) {
      var styles = document.getElementsByTagName("link");
      for (var i = 0; i < styles.length; i++) {
        for (var j = 0; j < appended.styles.length; j++) {
          if (styles[i].href == appended.styles[j].href) {
            styles[i].remove();
          }
        }
      }
    }
    appended = {
      scripts: [],
      styles: [],
      name: window.location.hash.slice(1) || "/"
    };
  }
  const routeResolved = resolveRoute(url);
  routeResolved();
};

//   Give the correspondent route (template) or fail
let resolveRoute = route => {
  try {
    return routes[route];
  } catch (error) {
    throw new Error("The route is not defined");
  }
};

var rootFn = () => {
  document.getElementById(appDiv).innerHTML = "";
}
route("/", rootFn)
window.addEventListener("hashchange", router);