
document.addEventListener("DOMContentLoaded", function () {
  var addButton = document.getElementById("addItem");
  addButton.addEventListener("click", addNewItem);
  document.body.style.width = "300px";

  var newItemInput = document.getElementById("newItem");
  newItemInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addNewItem();
    }
  });

  var openInTabIcon = document.getElementById("openInTab");
  openInTabIcon.addEventListener("click", function () {
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
    });
  });

  loadItems();
});

function addNewItem() {
  var newItemInput = document.getElementById("newItem");
  var newItem = newItemInput.value;
  if (newItem) {
    var todoItem = { text: newItem, completed: false };
    saveItem(todoItem, () => {
      addItemToList(todoItem);
      newItemInput.value = "";
    });
  }
}

function addItemToList(item, index) {
  var ul = document.getElementById("todoItems");
  var li = document.createElement("li");

  var textSpan = document.createElement("span");
  textSpan.textContent = item.text;
  textSpan.className = "todo-item";
  if (item.completed) {
    textSpan.classList.add("done");
  }
  li.appendChild(textSpan);

  var buttonsDiv = document.createElement("div");
  buttonsDiv.className = "action-buttons";

  var deleteButton = createButton("delete", "x", () => deleteItem(index, li));
  var doneButton = createButton("done", item.completed ? "u" : "'", () =>
    toggleDone(index, textSpan)
  );

  buttonsDiv.appendChild(deleteButton);
  buttonsDiv.appendChild(doneButton);
  li.appendChild(buttonsDiv);

  ul.appendChild(li);
}

function createButton(className, text, onClick) {
  var button = document.createElement("button");
  button.className = `button ${className}`;
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

function toggleDone(index, textSpan) {
  chrome.storage.sync.get({ items: [] }, function (data) {
    var items = data.items;
    items[index].completed = !items[index].completed;
    chrome.storage.sync.set({ items: items }, function () {
      textSpan.classList.toggle("done");
    });
  });
}

function deleteItem(index, listItem) {
  chrome.storage.sync.get({ items: [] }, function (data) {
    var items = data.items;
    items.splice(index, 1);
    chrome.storage.sync.set({ items: items }, function () {
      listItem.remove();
    });
  });
}

function saveItem(item, callback) {
  chrome.storage.sync.get({ items: [] }, function (data) {
    var items = data.items;
    items.push(item);
    chrome.storage.sync.set({ items: items }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error saving item:", chrome.runtime.lastError);
      } else {
        callback();
      }
    });
  });
}

function loadItems() {
  chrome.storage.sync.get({ items: [] }, function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error loading items:", chrome.runtime.lastError);
    } else {
      data.items.forEach(addItemToList);
    }
  });
}
