var CompositeDisposable = require('atom').CompositeDisposable
var path = require('path')

/* global atom */

var _disposables = new CompositeDisposable()

function activate () {
  _disposables.add(atom.workspace.observeTextEditors(function (editor) {
    _disposables.add(editor.onDidDestroy(renameTabs))
    _disposables.add(editor.onDidChangePath(renameTabs))
    _disposables.add(editor.onDidChangeTitle(renameTabs))
  }))
  _disposables.add(atom.workspace.observePanes(function (pane) {
    _disposables.add(pane.onDidMoveItem(renameTabs))
    _disposables.add(pane.onDidActivate(renameTabs))
  }))
  _disposables.add(atom.workspace.onDidOpen(renameTabs))

  // delay in case of refresh
  setTimeout(function () {
    renameTabs()
  }, 1500) // <-- atom is kinda slow starting up
}

function deactivate () {
  _disposables.dispose()
}

function renameTabs () {
  var elements = [].slice.call(document.querySelectorAll('li.tab .title'))
  var names = {}
  var tabs = elements.map(function (el) {
    var name = el.getAttribute('data-name')
    // don't rename temporary tabs or system tabs (like settings)
    if (!name) return

    names[name] = name in names ? names[name] + 1 : 1
    return {
      name: name,
      path: el.getAttribute('data-path'),
      element: el
    }
  })
  // filter out temps
  .filter(function (tab) { return tab })

  tabs.forEach(function (tab) {
    tab.uniqueName = names[tab.name] === 1
    setTimeout(function () {
      renameTab(tab, tabs)
    }, 20)
  })
}

// todo: allow user to configure this
function renameTab (tab, tabs) {
  let projectFolder

  // check if tab path in project roots, if so use the project root
  for (var i = atom.project.rootDirectories.length; i--;) {
    let rootDir = atom.project.rootDirectories[i]
    if (tab.path.substr(0, rootDir.path.length) === rootDir.path) {
      projectFolder = rootDir.path.split(path.sep).pop()
      break
    }
  }

  // otherwise, use the file's parent folder
  if (!projectFolder) {
    projectFolder = path.dirname(tab.path).split(path.sep).pop()
  }

  tab.element.innerText = projectFolder + ' — ' + tab.name
}

module.exports = {
  activate: activate,
  deactivate: deactivate
}
