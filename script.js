document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    let draggedItem = null;

    // Função para criar um novo item de tarefa
    function createTaskItem(taskText) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.draggable = true;

        const taskSpan = document.createElement('span');
        taskSpan.classList.add('task-text');
        taskSpan.textContent = taskText;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('task-buttons');

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        // Adicionando o botão de editar de volta
        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

        buttonsDiv.append(completeBtn, editBtn, deleteBtn);
        li.append(taskSpan, buttonsDiv);

        return li;
    }

    // Função para adicionar uma nova tarefa
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const newItem = createTaskItem(taskText);
            taskList.appendChild(newItem);
            taskInput.value = '';
        }
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Evento de clique na lista para gerenciar os botões
    taskList.addEventListener('click', (event) => {
        const clickedElement = event.target;
        const taskItem = clickedElement.closest('.task-item');
        if (!taskItem) return;

        // Concluir/Desmarcar tarefa
        if (clickedElement.classList.contains('complete-btn') || clickedElement.closest('.complete-btn')) {
            taskItem.classList.toggle('completed');
        }

        // Apagar tarefa (sem confirmação)
        if (clickedElement.classList.contains('delete-btn') || clickedElement.closest('.delete-btn')) {
            taskItem.remove();
        }

        // EDITAR TAREFA: Habilitar a edição ao clicar no botão de editar
        if (clickedElement.classList.contains('edit-btn') || clickedElement.closest('.edit-btn')) {
            const taskSpan = taskItem.querySelector('.task-text');
            
            // Cria um campo de input com o texto da tarefa
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = taskSpan.textContent;
            editInput.classList.add('edit-task-input');
            
            // Substitui o span pelo input
            taskItem.replaceChild(editInput, taskSpan);
            editInput.focus();

            // Salva a edição ao pressionar "Enter"
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const newText = editInput.value.trim();
                    if (newText !== '') {
                        taskSpan.textContent = newText;
                    }
                    taskItem.replaceChild(taskSpan, editInput);
                    taskItem.classList.remove('completed');
                }
            });

            // Salva a edição ao perder o foco (clicar fora)
            editInput.addEventListener('blur', () => {
                const newText = editInput.value.trim();
                if (newText !== '') {
                    taskSpan.textContent = newText;
                }
                taskItem.replaceChild(taskSpan, editInput);
                taskItem.classList.remove('completed');
            });
        }
    });

    // Eventos de Drag and Drop
    let dragSrcEl = null;

    taskList.addEventListener('dragstart', (e) => {
        dragSrcEl = e.target.closest('.task-item');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', dragSrcEl.innerHTML);
        dragSrcEl.classList.add('dragging');
    });

    taskList.addEventListener('dragend', (e) => {
        dragSrcEl.classList.remove('dragging');
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const draggingElement = document.querySelector('.task-item.dragging');
        if (afterElement == null) {
            taskList.appendChild(draggingElement);
        } else {
            taskList.insertBefore(draggingElement, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});