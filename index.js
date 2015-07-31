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
  if (tab.uniqueName) {
    tab.element.innerText = tab.name
  } else {
    var dir = path.dirname(tab.path)
    var dirs = dir.split(path.sep)
    var prevDir = dirs[dirs.length - 1]
    tab.element.innerText = tab.name + ' - ' + prevDir
  }
}

module.exports = {
  activate: activate,
  deactivate: deactivate
}
