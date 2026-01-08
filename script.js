var today = new Date().toISOString().slice(0, 16);
document.getElementById('inputDeadline').min = today;
const createTodo = async (createTodoBody) => {
    await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createTodoBody)
    })
}

const markTodoDone = async (id,done) => {
    const isDone = done === true || done === 'true';
     console.log('PATCH CALLED WITH →', id, done, 'sending', !isDone);
    const res = await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "done":!isDone
        })
    });
    console.log('PATCH STATUS →', res.status);
}

const fetchTodos = async () => {
    console.log("FetchToDo is working till here");
    document.getElementById("todosContainer").innerHTML = '';
    const res = await fetch('http://localhost:3000/todos')
    try {
        if (!res.ok) {
            throw new Error(`Response status: ${res.status}`);
        }
        const todos = await res.json();
        return todos;

    } catch (error) {
        console.log("API Failing to register");
        console.error(error.message);
    }
}

const deleteTodo = async (id) => {
    await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE'
    })
}
const setTodoInLocalStorage=(todos)=>{
    const todoList=[];
    todos.forEach((todo)=>{
        todoList.push(todo);
    });
    localStorage.setItem('todos', JSON.stringify(todoList));
    console.log(JSON.parse(localStorage.getItem('todos')));
}

const handleAddTodo = async (e) => {
    e.preventDefault();
    console.log('event : ', e);
    const todo = document.getElementById("inputTodo").value;
    const deadline = new Date(document.getElementById("inputDeadline").value);
    console.log(deadline);
    const timestamp = new Date();

    if (deadline > timestamp && todo.length > 3) {
        await createTodo({
            "todo": todo,
            "done": false,
            "timestamp": timestamp,
            "deadline": deadline
        });
    }
    mapTodos();
    document.getElementById("inputTodo").innerHTML='';
    document.getElementById("inputDeadline").innerHTML='';
    document.getElementById('msg').innerHTML="<p style='color: green;'>Todo has beed added successfully</p>";
}
function getCheckedTodoIds() {
    const checkboxes = document.querySelectorAll('.todosContainer input[type="checkbox"]:checked');
    console.log(checkboxes);
    return Array.from(checkboxes).map(cb =>({
        id:cb.dataset.todoId,
        div:cb.closest('.todo'),
        done: cb.dataset.todoDone,
        checkbox:cb
    }));
}
// function getCheckedTodoDivs() {
//     const checkboxes = document.querySelectorAll('.todosContainer input[type="checkbox"]:checked');
//     console.log(checkboxes);
//     return Array.from(checkboxes).map(cb => cb.closest('.todo'));
// }

const handleMarkMultipleTodoDone=async ()=>{
    const checkedIDs=getCheckedTodoIds();
    for(const todo of checkedIDs) {
        console.log(todo.id,todo.done);
        await markTodoDone(todo.id, todo.done);
        console.log(todo.id,todo.done);
        mapTodos();
        document.getElementById('msg').innerHTML="<p style='color: green;'>Todo has beed completed successfully</p>";

    }
}


const handleDeleteMultiple = async () => {
    const checkedIDs = getCheckedTodoIds();
    checkedIDs.forEach((t) => {
        console.log(t);
        console.log("Before clear", t.div.innerHTML);
        const node = t.div;
        node.remove();
        console.log("After clear", node.innerHTML);
        console.log(t.id);
        deleteTodo(t.id);
    });
    // window.location.reload();
    // mapTodos();
    // await fetchTodos();
    document.getElementById('msg').innerHTML="<p style='color: green;'>Todo has beed deleted successfully</p>";
    return;
}

document.getElementById('todosContainer').addEventListener('click', async (e) => {
    if (e.target.alt === 'trash') {
        const todoId = e.target.dataset.todoId;
        console.log(todoId);
        e.target.closest('.todo').remove();
        await deleteTodo(todoId);
    }
    document.getElementById('msg').innerHTML="<p style='color: green;'>Todo has beed deleted successfully</p>";
});


window.onload = (event) => {
    mapTodos();
}
const mapTodos = async () => {
    document.getElementById('todosContainer').innerHTML='';
    const todos = await fetchTodos();
    setTodoInLocalStorage(todos);
    console.log(todos[0]);
    console.log(todos);

    var all=0,done=0,overdue=0;rest=0;
    todos.forEach((todo) => {
        all++;
        if(todo.done)
            done++;
        if(!todo.done && new Date(todo.deadline)<new Date())
            overdue++;
    });
    rest=all-done;
    todos.forEach((todo) => {
        const child = document.createElement('div');
        child.className = "todo border"
        child.dataset.todoId = todo.id;
        if(todo.done){
            child.innerHTML=`<div class="upperTodo"><input type="checkbox" id="checkbox" data-todo-id="${todo.id}"><p>${todo.todo}</p><img src="images/edit.png" alt="edit"><img src="images/trash.png" alt="trash" data-todo-id="${todo.id}"></div><div class="lowerTodo"><p>Completed</p></div>`
        }
        else if(new Date(todo.deadline)<new Date()){
            child.innerHTML=getChild(todo);
        }
        else
            child.innerHTML=getChild(todo);
        document.getElementById('todosContainer').appendChild(child);

    });

}
const getChild=(todo)=>{
        return `
                <div class="upperTodo">
                    <input type="checkbox" id="checkbox" data-todo-id="${todo.id}" data-todo-done="${todo.done}">
                    <p>${todo.todo}</p>
                    <img src="images/edit.png" alt="edit">
                    <img src="images/trash.png" alt="trash" data-todo-id="${todo.id}" data-todo-done="${todo.done}">
                </div>
                <div class="lowerTodo">
                    <p>
                        Due on: ${todo.deadline.slice(0, 16).replace('T', " ")}
                    </p>
                </div>`
        
}