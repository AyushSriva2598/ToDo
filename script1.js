
var today = new Date().toISOString().slice(0, 16);
document.getElementById('inputDeadline').min = today;
const createTodo = async (createTodoBody) => {
    await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(createTodoBody)
    })
}
const deleteTodo = async (id) => {
    await fetch(`http://localhost:3000/todos/${id}`, {
        method: "DELETE"
    })
}
const editTodo = async (id, editTodoBody) => {
    await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(editTodoBody)
    })
}
const markTodoDone = async (id, done) => {
    await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "done": !done
        })
    })
}
const handleEdit = async (id) => {
    // console.log('handleEdit called with id: ', id);
    const fetchedTodo = await fetch(`http://localhost:3000/todos/${id}`).then(res => res.json());
    const todo = fetchedTodo.todo;
    document.getElementById('inputTodo').value = todo;
    document.getElementById('inputDeadline').value = new Date(fetchedTodo.deadline).toISOString().slice(0, 16);
    document.getElementById('inputDeadline').setAttribute("disabled", "");
    const key = fetchedTodo.id;
    document.getElementById('inputTodo').focus();
    document.getElementById('addBtn').style.display = "none";
    document.getElementById('editBtn').style.display = "block";
    document.getElementById('editBtn').onclick = async () => {
        const updatedTodo = document.getElementById('inputTodo').value;
        await editTodo(key, {
            "todo": updatedTodo,
        });
        document.getElementById('addBtn').style.display = "block";
        document.getElementById('editBtn').style.display = "none";
        document.getElementById('inputTodo').value = '';
        document.getElementById('inputDeadline').value = '';
        mapTodos();
        document.getElementById('msg').innerHTML = "<p style='color: green;'>Todo edited successfully</p>";
        document.getElementById('inputDeadline').removeAttribute('disabled');
        setTimeout(() => {
            document.getElementById('msg').innerHTML = '';
        }, 3000)
    }
}
const handleDelete = async (id) => {
    await deleteTodo(id);
    mapTodos();
    document.getElementById('msg').innerHTML = "<p style='color: green;'>Todo Deleted successfully</p>";
    setTimeout(() => {
        document.getElementById('msg').innerHTML = '';
    }, 3000)
}
let checked = [];
const handleCheck = (id) => {
    let n = checked.length;
    for (i = 0; i < n; i++) {
        if (checked[i] == id) {
            checked.splice(i, 1);
            return;
        }
    }
    checked.push(id);
    return;
}
const handleDeleteMultiple = async () => {
    let len = checked.length;
    if (checked.length == 0) {
        // alert('please check atleast one checkbox')
        document.getElementById('msg').innerHTML = "<p style='color: red;'>Please check atleast one checkbox.</p>"
        setTimeout(() => {
            document.getElementById('msg').innerHTML = "";
        }, 3000)
        return;
    } else {
        for (const id of checked) {
            await handleDelete(id);
        }
        checked = [];

        mapTodos();
        document.getElementById('msg').innerHTML = `<p style='color: green;'>${len} todos Deleted sucessfully.</p>`;
        setTimeout(() => {
            document.getElementById('msg').innerHTML = '';
        }, 3000)
    }
}
const handleMarkMultipleTodoDone = async () => {
    if (checked.length == 0) {
        document.getElementById('msg').innerHTML = "<p style='color: red;'>Please check atleast one checkbox.</p>"
        setTimeout(() => {
            document.getElementById('msg').innerHTML = "";
        }, 3000)
        return;
    } else {
        const len = checked.length;
        for (const id of checked) {
            await markTodoDone(id);
        }
        checked = [];

        mapTodos();
        document.getElementById('msg').innerHTML = `<p style='color: green;'>Kudos on completing ${len} todos!</p>`;
        setTimeout(() => {
            document.getElementById('msg').innerHTML = '';
        }, 3000)
    }

}
const fetchTodos = async () => {
     
    // const res = await fetch('http://localhost:3000/todos')
    // const todos = res.json();
    try {
        const res = await fetch('http://localhost:3000/todos')
        const todos = res.json();
        return todos
    } catch (e) {
        document.getElementById('msg').innerHTML = "<p style='color: red;'>Our servers are experiencing some downtime.</p>"
        console.log('returning localstorage items');
        return JSON.parse(localStorage.getItem('todos'));
    }
    // return todos;
}
const handleDoubleClick = async (id, done) => {
    await markTodoDone(id, done)
    mapTodos();
}

const getTodoDescription = (todo) => {
    // console.log('child clicked');
    document.getElementById('belowDashboard').innerHTML = `<div class="" style="height: 100%; width: 100%; border-radius: 20px; padding: 2vw;"><div class="" style="height: 100%; width: 100%; display: flex; flex-direction: column; gap:1vw; overflow: scroll;"><div class="head"
                    style="display: flex; width: 100%; height: 12%; justify-content: space-between; margin-bottom: 0.7vw; align-items: center;">
                    <h3 class=>Todo Description</h3>
                    <button onclick='getChart()' style="width: 10%; height: 100%; font-size: larger; border: none; background-color: transparent; color: white;
            background-color: #4d4d4d;
            border-radius: 5px;
            font-size: large;">
                        X
                    </button>
                </div><p>${todo.todo}</p><p style="margin-top:auto; font-size: larger;">${todo.done ? '<p style="color: green; font-size: larger;transform: rotate(-8deg); border: 2px dashed green; width: fit-content; padding: 0.5vw; border-radius: 5px; margin-left: auto">Completed</p>' : new Date(todo.deadline) < new Date() ? '<p style="color: red; font-size: larger;transform: rotate(-8deg); border: 2px dashed red; width: fit-content; padding: 0.5vw; border-radius: 5px; margin-left: auto">Overdue</p>' : 'Due on: ' + todo.deadline.slice(0, 16).replace('T', ' ')}</p></div></div>`
}

const getChart = () => {
    mapTodos();
}
const setTodoInLocalStorage = (todos) => {
    const todoList = [];
    for (let todo of todos) {
        todoList.push(todo);
    }
    localStorage.setItem('todos', JSON.stringify(todoList));
}
console.log(JSON.parse(localStorage.getItem('todos')));



const mapTodos = async () => {
    const todos = await fetchTodos();
    //todos is an object of objects from fetch request;
    setTodoInLocalStorage(todos);


    document.getElementById('todosContainer').innerHTML = '';
    let all = 0, done = 0, rest = 0, overdue = 0;
    for (let todo of todos) {
        all++;
        if (todo.done) {
            done++;
        } if (!todo.done && new Date(todo.deadline) < new Date()) overdue++;
    }
    rest = all - done;
    var xValues = ["Done", "Pending", "Overdue"];
    var yValues = [done, rest - overdue, overdue];
    var barColors = [
        "#00aba9",
        "#2b5797", 
        
        "#b91d47"
    ];
    await new Chart("canvas", {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
    });

    document.getElementById('restTodo').innerText = rest - overdue;
    document.getElementById('restTodo').style.fontSize = "3vh"
    document.getElementById('allTodo').innerText = all;
    document.getElementById('allTodo').style.fontSize = "3vh"
    document.getElementById('doneTodo').innerText = done;
    document.getElementById('doneTodo').style.fontSize = "3vh"
    document.getElementById('dueTodo').innerText = overdue;
    document.getElementById('dueTodo').style.fontSize = "3vh"

    for (const todo of todos) {
        const child = document.createElement('div');
        child.classList.add('todo', 'border');
        child.ondblclick = () => handleDoubleClick(todo.id, todo.done)
        child.style.backgroundColor = "#f4f7ff";
        child.style.cursor = "pointer";
        child.draggable = true;
        child.onclick = () => getTodoDescription(todo);
        child.onmousedown = () => {
            console.log('mouse down event on child');
        }
        if (todo.done) {
            child.style.backgroundColor = "#d0f4ea";
            child.innerHTML = `<div class="upperTodo"><p class='line-through' style='width: 80%;'>${todo.todo}</p><img src="images/edit.png" onClick='handleEdit(${todo.id})' alt="edit"><img src="images/trash.png" onClick='handleDelete(${todo.id})' alt="trash"></img></div><div class="lowerTodo"><p style='color: green;'>Completed</p></div>`
        } else if (new Date(todo.deadline) < new Date()) {
            child.style.backgroundColor = "#e7acac";
            child.innerHTML = getChild(todo);
        }
        else {
            child.innerHTML = getChild(todo);
        }
        document.getElementById('todosContainer').appendChild(child);
    }
}

mapTodos();
const handleAddTodo = async () => {
    const todo = document.getElementById('inputTodo').value;
    const deadline = new Date(document.getElementById('inputDeadline').value);
    const timestamp = new Date();

    if (deadline > timestamp && todo.length >= 3) {
        await createTodo({
            "todo": todo,
            "done": false,
            "timestamp": timestamp,
            "deadline": deadline
        });

        mapTodos();
        document.getElementById('inputTodo').value = '';
        document.getElementById('inputDeadline').value = '';

        document.getElementById('msg').innerHTML = "<p style='color: green;'>Todo has beed added successfully</p>";
        setTimeout(() => {
            document.getElementById('msg').innerHTML = '';
        }, 3000)
    } else {
        // alert('please input a valid input');
        document.getElementById('msg').innerHTML = "<p style='color: red;'>Please give valid Todo and Deadline.</p>";
        setTimeout(() => {
            document.getElementById('msg').innerHTML = '';
        }, 3000)
    }
}

// console.log(new Date(), new Date().toString())


const getChild = (todo) => {
    return `<div class="upperTodo"><input type="checkbox" onchange='handleCheck(${todo.id})'><p>${todo.todo}</p><img src="images/edit.png" onClick='handleEdit(${todo.id})' alt="edit"><img src="images/trash.png" onClick='handleDelete(${todo.id})' alt="trash"></img></div><div class="lowerTodo"><p>Due on: ${todo.deadline.slice(0, 16).replace('T', " ")}</p></div>`
}

document.getElementById('dashDone').onclick = async () => {
    const todos = await fetchTodos();
    document.getElementById('todosContainer').innerHTML = '';
    for (const todo of todos) {
        if (todo.done) {
            const child = document.createElement('div');
            child.classList.add('todo', 'border');
            child.ondblclick = () => handleDoubleClick(todo.id, todo.done)
            child.onclick = () => getTodoDescription(todo);
            child.style.cursor = "pointer";
            child.style.backgroundColor = "#d0f4ea";
            child.innerHTML = `<div class="upperTodo"><p class='line-through' style='width: 80%;'>${todo.todo}</p><img src="images/edit.png" onClick='handleEdit(${todo.id})' alt="edit"><img src="images/trash.png" onClick='handleDelete(${todo.id})' alt="trash"></img></div><div class="lowerTodo"><p style='color: green;'>Completed</p></div>`
            document.getElementById('todosContainer').appendChild(child);
        }
    }
}


document.getElementById('dashAll').onclick = () => {
    mapTodos();
}


document.getElementById('dashRest').onclick = async () => {
    const todos = await fetchTodos();
    document.getElementById('todosContainer').innerHTML = '';
    for (const todo of todos) {
        if (!todo.done) {
            const child = document.createElement('div');
            child.style.backgroundColor = "#f4f7ff";
            if (new Date(todo.deadline) < new Date()) {
                child.style.backgroundColor = "#e7acac";
            }
            child.classList.add('todo', 'border');
            child.onclick = () => getTodoDescription(todo);
            child.ondblclick = () => handleDoubleClick(todo.id, todo.done)
            child.style.cursor = "pointer";
            child.innerHTML = getChild(todo);
            document.getElementById('todosContainer').appendChild(child);
        }
    }
}


document.getElementById('dashDue').onclick = async () => {
    const todos = await fetchTodos();
    document.getElementById('todosContainer').innerHTML = '';
    for (const todo of todos) {
        if (new Date(todo.deadline) < new Date() && !todo.done) {
            const child = document.createElement('div');
            child.style.backgroundColor = "#e7acac";
            child.classList.add('todo', 'border');
            child.ondblclick = () => handleDoubleClick(todo.id, todo.done)
            child.onclick = () => getTodoDescription(todo);
            child.style.cursor = "pointer";
            child.innerHTML = getChild(todo);
            document.getElementById('todosContainer').appendChild(child);
        }
    }
}
