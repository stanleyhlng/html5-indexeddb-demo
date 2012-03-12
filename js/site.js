
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

	if ('webkitIndexedDB' in window) {
		window.IDBTransaction = window.webkitIDBTransaction;
		window.IDBKeyRange = window.webkitIDBKeyRange;
	}

	var fbspotlight = {};
	fbspotlight.indexedDB = {};

	fbspotlight.indexedDB.db = null;
	
	fbspotlight.indexedDB.onerror = function(e) {
		console.log(e);
	}
	
	fbspotlight.indexedDB.open = function() {
		console.log("open");
		
		var v = "1.0";
		var request = indexedDB.open("todo", v);

		request.onupgradeneeded = function(e) {
			console.log("onupgradeneeded");
			
			fbspotlight.indexedDB.db = e.target.result;
			
			var db = fbspotlight.indexedDB.db;
			var store = db.createObjectStore("todo", {keyPath: "timestamp"});
		}
		
		request.onfailure = fbspotlight.indexedDB.onerror;
		
		request.onsuccess = function(e) {
			console.log("onsuccess");

			fbspotlight.indexedDB.db = e.target.result;

			fbspotlight.indexedDB.getAllTodoItems();
		}
	}
	
	fbspotlight.indexedDB.addTodo = function(todoText) {
		var db = fbspotlight.indexedDB.db;
		var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
		var store = trans.objectStore("todo");
		var request = store.put({
			"text": todoText,
			"timestamp" : new Date().getTime()
		});
		
		request.onsuccess = function(e) {
			fbspotlight.indexedDB.getAllTodoItems();
		}
		
		request.onerror = function(e) {
			console.log(e.value);
		}
	}
	
	fbspotlight.indexedDB.getAllTodoItems = function() {
		var todos = document.getElementById("todoItems");
		todos.innerHTML = "";
		
		var db = fbspotlight.indexedDB.db;
		var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
		var store = trans.objectStore("todo");
		
		// Get everything in the store
		var keyRange = IDBKeyRange.lowerBound(0);
		var cursorRequest = store.openCursor(keyRange);
		
		cursorRequest.onsuccess = function(e) {
			var result = e.target.result;
			if (!!result == false) {
				return;
			}
			renderTodo(result.value);
			result.continue();
		}
		
		cursorRequest.onerror = fbspotlight.indexedDB.onerror;
	}
	
	function renderTodo(row) {
		var todos = document.getElementById("todoItems");
		var li = document.createElement("li");
		var a = document.createElement("a");
		var t = document.createTextNode(row.text);
		//t.data = row.text;
		
		a.addEventListener("click", function(e) {
			fbspotlight.indexedDB.deleteTodo(row.timestamp);
			}, 
			false);
		
		a.textContent = " [Delete]";
		li.appendChild(t);
		li.appendChild(a);
		todos.appendChild(li);
	}
	
	fbspotlight.indexedDB.deleteTodo = function(id) {
		var db = fbspotlight.indexedDB.db;
		var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
		var store = trans.objectStore("todo");
		
		var request = store.delete(id);
		
		request.onsuccess = function(e) {
			fbspotlight.indexedDB.getAllTodoItems();
		};
		
		request.onerror = function(e) {
			console.log(e);
		};
	}
	
	function init() {
		console.log("init");
		fbspotlight.indexedDB.open();
	}
	
	window.addEventListener("DOMContentLoaded", init, false);
	
	function addTodo() {
		var todo = document.getElementById("todo");
		
		fbspotlight.indexedDB.addTodo(todo.value);
		todo.value = "";
	}

