// public/main.js

const baseApi = '/api';

document.addEventListener('DOMContentLoaded', () => {
  loadEmployees();

  const form = document.getElementById('employeeForm');
  form.addEventListener('submit', onSave);

  document.getElementById('resetBtn').addEventListener('click', resetForm);

  document.getElementById('csvForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('csvfile');
    if (!fileInput.files.length) return alert('Selecciona un CSV');
    const fd = new FormData();
    fd.append('csvfile', fileInput.files[0]);
    const res = await fetch(baseApi + '/upload-csv', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      alert('CSV cargado correctamente');
      fileInput.value = '';
      loadEmployees();
    } else {
      alert('Error al subir CSV: ' + (data.error || res.statusText));
    }
  });
});

async function loadEmployees() {
  const tbody = document.querySelector('#employeesTable tbody');
  tbody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>'; // Loading state
  const res = await fetch(baseApi + '/employees');
  let rows = [];
  try {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    rows = await res.json();
  } catch (error) { tbody.innerHTML = `<tr><td colspan="8">Error al cargar empleados: ${error.message}</td></tr>`; return; }

  tbody.innerHTML = '';
  rows.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id ?? i+1}</td>
      <td>${escapeHtml(r.Name)}</td>
      <td>${escapeHtml(r.Email)}</td>
      <td>${escapeHtml(r.Charge)}</td>
      <td>${escapeHtml(r.City)}</td>
      <td>${r.Salary ?? ''}</td>
      <td>${r.Age ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${r.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${r.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (rows.length === 0) tbody.innerHTML = '<tr><td colspan="8">No hay empleados registrados.</td></tr>';
}

function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function onSave(e) {
  e.preventDefault();
  const id = document.getElementById('empId').value;
  const payload = {
    Name: document.getElementById('Name').value.trim(),
    Lastname: document.getElementById('Lastname').value.trim(),
    Lastname2: document.getElementById('Lastname2').value.trim(),
    Email: document.getElementById('Email').value.trim(),
    Charge: document.getElementById('Charge').value.trim(),
    City: document.getElementById('City').value.trim(),
    Salary: Number(document.getElementById('Salary').value) || 0,
    Age: Number(document.getElementById('Age').value) || 0
  };

  if (!payload.Name || !payload.Lastname) return alert('Name y Lastname son requeridos');

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${baseApi}/employees/${id}` : `${baseApi}/employees`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    alert('Error: ' + (data.error || res.statusText));
    return;
  }
  resetForm();
  loadEmployees();
}

function resetForm(){
  document.getElementById('empId').value = '';
  document.getElementById('employeeForm').reset();
  document.getElementById('saveBtn').textContent = 'Guardar';
}

window.editEmployee = async function(id){
  const res = await fetch(`${baseApi}/employees/${id}`);
  if (!res.ok) return alert('No se pudo obtener empleado');
  const emp = await res.json();
  document.getElementById('empId').value = emp.id;
  document.getElementById('Name').value = emp.Name || '';
  document.getElementById('Lastname').value = emp.Lastname || '';
  document.getElementById('Lastname2').value = emp.Lastname2 || '';
  document.getElementById('Email').value = emp.Email || '';
  document.getElementById('Charge').value = emp.Charge || '';
  document.getElementById('City').value = emp.City || '';
  document.getElementById('Salary').value = emp.Salary || '';
  document.getElementById('Age').value = emp.Age || '';
  document.getElementById('saveBtn').textContent = 'Actualizar';
};

window.deleteEmployee = async function(id){
  if (!confirm('¿Eliminar este empleado?')) return;
  const res = await fetch(`${baseApi}/employees/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) return alert('Error: ' + (data.error || res.statusText));
  loadEmployees();
};
