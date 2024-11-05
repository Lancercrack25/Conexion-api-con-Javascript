async function AppiStudents()
{
	try
	{
		const respuesta = await fetch("http://localhost:8080/student");

		if(respuesta.ok)
		{
			const datos =  await respuesta.json();//variable que transforma la respuesta en formato json para poder manipular los datos mas facilmente en el javascript
			let informacion = '' //variable string vacio que nos va ayudar despues a generar las filas de cada uno de los estudiantes que se encuentren en la lista de nuestro json
			datos.forEach(estudiantes => {
				//variable que anteriormente estaba vacia pero ahora por cada uno de los estudiantes que hay en la lista de nuestro json genera una fila en la tabla donde muestra sus respectivos datos
				informacion += `
						<tr>
							<td>${estudiantes.id}</td>
							<td class="editable" data-field="name">${estudiantes.name}</td>
							<td class="editable" data-field="code">${estudiantes.code}</td>
							<td class="editable" data-field="email">${estudiantes.email}</td>
							<td class="editable" data-field="degree">${estudiantes.degree}</td>
							<td class="editable" data-field="score">${estudiantes.score}</td>
							<td><button class="btn btn-danger"  data-code="${estudiantes.code}">Delete</button></td>
							<td><button class="btn btn-warning" data-code="${estudiantes.code}" data-id = "${estudiantes.id}">Edit</button></td>
						</tr>
					`;
			});
			//mostramos las filas que se generaron en nuestra tabla
			document.getElementById("info-table").innerHTML = informacion;
			//cuando le damos click a alguno de los botones de nuestras filas,obtiene el contenido de nuestro data-code para poder relizar la eliminacion por codigo
			document.querySelectorAll(".btn-danger").forEach(button =>{
				button.addEventListener('click', async (event) => {
					const code = event.target.getAttribute('data-code');
					await deletebycode(code);
				});
			});
			//cuando le damos click a alguno de los botones de editar de nuestra fila, al darle click obtenemos el id y el codigo para poder realizar la actualizacion de los datos de la fila seleccionada
			document.querySelectorAll(".btn-warning").forEach(button => {
				button.addEventListener('click',(event) => {
					const code = event.target.getAttribute('data-code');
					const id = event.target.getAttribute('data-id');
					const row = event.target.closest('tr');
					// desabilitamos el evento de tipo click  a los demas botones de las demas filas en las que no estemos editando
					document.querySelectorAll(".btn-warning").forEach(btn => {
						if (btn !== event.target) {
							btn.disabled = true; 
						}
					});

					if (event.target.textContent == 'Edit') { //si el contenido de texto del boton es edit
						editStudentRow(row);
						event.target.textContent = 'Save';
						event.target.classList.remove('btn-warning');
						event.target.classList.add('btn-success');
					} else { //en el caso de que el contenido de texto del boton sea save
						saveStudentRow(row,code,id);
						//una vez hecho los cambios en la fila que se estaba editando volvemos a habilitar el evento de tipo click a todos los botones para asi volver a editar una fila que nosotros seleccionemos 
						document.querySelectorAll(".btn-warning").forEach(btn => {
							if (btn !== event.target) {
								btn.disabled = false;
							}
						});
						event.target.textContent = 'Edit';
						event.target.classList.remove('btn-success');
						event.target.classList.add('btn-warning');
					}
				});
			});
		}
	}
	catch(error)
	{
		console.log(error);
	}
}

AppiStudents();

//funcion asincrona que nos ayuda a realizar el metodo delete
async function deletebycode(code){
	const respuesta = await fetch(`http://localhost:8080/student/delete-by-code?code=${code}`,{
		method: 'DELETE'
	});

	if(respuesta.ok)
	{
		console.log("El estudiante se elimino exitosamente");
		AppiStudents();
	}
	else
	{
		console.log("Estudiante no encontrado");
	}
}

//funcion asincrona que nos ayuda a realizar el metodo post
async function sendStudents(studentdata) {
	const respuesta = await fetch("http://localhost:8080/student",{
		method: 'POST',
		headers:{
			'content-Type':'application/json'
		},
		body: JSON.stringify(studentdata)
	});
	if(respuesta.ok)
	{
		console.log("La lista de estudiantes se actualizo exitosamente");
		return await respuesta.json();
	}
	else
	{
		console.log("Hubo un error al intentar realizar la solicitud");
	}
}
//lineas 114 a 153, nos ayudan a enviar a la base de datos los datos que ingresemos en los inputs de nuestro formulario para poder actualizar la lista de nuestro json y que se generen mas filas en nuestra tabla
document.getElementById("studentForm").addEventListener("submit",

	async function(event){
		event.preventDefault();

		//obtenemos los valores que el usuario ingresa en el formulario
		var studentCodeFromForm = document.getElementById("code").value;
		var studentNameFromForm = document.getElementById("name").value;
		var studentDegreeFromForm = document.getElementById("degree").value;
		var studentScoreFromForm = document.getElementById("score").value;
		var studentEmailFromForm = document.getElementById("email").value;
		//validacion del formulario, verifica que si alguno de los inputs a llenar del formulario esta vacio
		if(studentCodeFromForm == ''||studentNameFromForm == ''||studentDegreeFromForm == ''||studentScoreFromForm == ''|| studentEmailFromForm == '')
		{
			//en caso de que el usuario haya olvidado llenar un campo, se le mostrara esta alerta
			alert('No lleno los campos que se requieren en este formulario');
		}
		else
		{
			//creamos un objeto en el cual se transformara en json donde se enviaran los datos de un estudiante 
			const studentdata =
				{
					name :studentNameFromForm,
					code :studentCodeFromForm,
					email : studentEmailFromForm,
					degree :studentDegreeFromForm,
					score : studentScoreFromForm
				};
			//variable que almacena la espera de que la funcion finalize correctamente y que la solicitud que realize sea exitosa
			const nuevoestudiante = await sendStudents(studentdata);
			//si la funcion asincrona finalizo correctamente y la solicitud que realiza esa funcion tambien fue exitosa
			if(nuevoestudiante)
			{
				AppiStudents();
				//limpiamos el formulario una vez que los datos ingresados en el formulario fueron enviados
				document.querySelector("#studentForm").reset();
			}
		}
	}
);

//funcion asincrona que nos ayuda a realizar el metodo put
async function updateStudents(code,studentdata) {
	const respuesta = await fetch(`http://localhost:8080/student/update-by-code?code=${code}`,{
		method: 'PUT',
		headers:{
			'content-Type':'application/json'
		},
		body: JSON.stringify(studentdata)
	});
	if(respuesta.ok)
	{
		console.log("La lista de estudiantes se actualizo exitosamente");
		AppiStudents();
	}
	else
	{
		console.log("Hubo un error al intentar realizar la solicitud");
	}
}
//funcion que nos ayuda a editar las celdas de nuestra fila con la que deseemos por medio de inputs en los qeu se les asigna los valores de lasceldas de la fila para cambiar los datos, esto ocurre cuando le demos click al boton de "edit"
function editStudentRow(row) {
	const cells = row.querySelectorAll('.editable');
	cells.forEach(cell => {
		const field = cell.getAttribute('data-field');
		const originalValue = cell.textContent;
		cell.innerHTML = `<input type="text" value="${originalValue}" data-field="${field}" class = "inputable">`;
	});
}
//funcion asincrona que nos permite guardar los cambios una vez que modifiquemos los valores de los inputs y le demos click en "save" para que se guarden  y se actualizen los nuevos valores en la tabla y de nuestra base de datos
async function saveStudentRow(row, code,id) {
	const cells = row.querySelectorAll('.editable input');
	const studentdata = {id:id,};

	cells.forEach(cell => {
		const field = cell.getAttribute('data-field');
		studentdata[field] = cell.value;
	});
	//variable que almacena la espera de que la funcion finalize correctamente y que la solicitud que realize sea exitosa
	const updatedStudent = await updateStudents(code,studentdata);
	//si la funcion asincrona finalizo correctamente y la solicitud que realiza esa funcion tambien fue exitosa
	if (updatedStudent) {
		AppiStudents();
	}
}
