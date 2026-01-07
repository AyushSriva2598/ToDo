const createTodo = async (createTodoBody) => {
    await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createTodoBody)
    })
}
const fetchTodos = async () => {
    console.log("FetchToDo is working till here");
    document.getElementById("todosContainer").innerHTML='';
    const res = await fetch('http://localhost:3000/todos')
    try {
        if (!res.ok) {
            throw new Error(`Response status: ${res.status}`);
        }
        const todos = await res.json();
        console.log(todos[0]);
        console.log(todos);
        todos.forEach((todo) => {
            const child = document.createElement('div');
            child.className="todo border"
            child.dataset.todoId = todo.id;
            console.log(typeof(todo.deadline));
            child.innerHTML =`
                <div class="upperTodo">
                    <input type="checkbox" id="checkbox" data-todo-id="${todo.id}">
                    <p>${todo.todo}</p>
                    <img src="images/edit.png" alt="edit">
                    <img src="images/trash.png" alt="trash" data-todo-id="${todo.id}">
                </div>
                <div class="lowerTodo">
                    <p>
                        Due on: ${todo.deadline.slice(0,16).replace('T'," ")}
                    </p>
                </div>`
            document.getElementById("todosContainer").appendChild(child);

        });
    } catch (error) {
        console.error(error.message);
    }
}


const deleteTodo = async (id) => {
    await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE'
    })
}

const handleAddTodo = async (e) => {
    e.preventDefault();
    console.log('event : ', e);
    const todo = document.getElementById("inputTodo").value;
    const deadline = new Date(document.getElementById("inputDeadline").value);
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

}
function getCheckedTodoIds(){
    const checkboxes = document.querySelectorAll('.todosContainer input[type="checkbox"]:checked');
    console.log(checkboxes);
    return Array.from(checkboxes).map(cb => cb.dataset.todoId);
}
function getCheckedTodoDivs(){
    const checkboxes = document.querySelectorAll('.todosContainer input[type="checkbox"]:checked');
    console.log(checkboxes);
    return Array.from(checkboxes).map(cb => cb.closest('.todo'));
}

const handleDeleteMultiple= async ()=>{
    const checkedIDs= getCheckedTodoIds();
    const checkedDivs= getCheckedTodoDivs();
    checkedDivs.forEach((t) =>{
        console.log(t); 
        console.log("Before clear",t.innerHTML);
        const node=t;
        node.remove();
        console.log("After clear",node.innerHTML);
    });
    checkedIDs.forEach((id)=>{
        console.log(id);
         deleteTodo(id);
    });
    // window.location.reload();
    // mapTodos();
    // await fetchTodos();
    return;
}

document.getElementById('todosContainer').addEventListener('click',async (e)=>{
    if(e.target.alt==='trash'){
        const todoId=e.target.dataset.todoId;
        console.log(todoId);
        e.target.closest('.todo').remove();
        await deleteTodo(todoId);
    }
});


window.onload=(event) =>{
    mapTodos();
}
const mapTodos = async () => {
    await fetchTodos();
}