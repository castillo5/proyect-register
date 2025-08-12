// public/main.js - Módulos ES6 con Vite

// Configuración de la API
const config = {
  baseApi: '/api',
  endpoints: {
    employees: '/employees',
    uploadCsv: '/upload-csv'
  }
};

// Utilidades
const utils = {
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  showMessage(message, type = 'info') {
    // Crear un sistema de notificaciones simple
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      z-index: 1000;
      ${type === 'error' ? 'background-color: #f44336;' : 
        type === 'success' ? 'background-color: #4caf50;' : 
        'background-color: #2196f3;'}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
};

// API Service
class EmployeeService {
  static async getAll() {
    const response = await fetch(`${config.baseApi}${config.endpoints.employees}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async create(employee) {
    const response = await fetch(`${config.baseApi}${config.endpoints.employees}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async update(id, employee) {
    const response = await fetch(`${config.baseApi}${config.endpoints.employees}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async delete(id) {
    const response = await fetch(`${config.baseApi}${config.endpoints.employees}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async uploadCsv(file) {
    const formData = new FormData();
    formData.append('csvfile', file);
    const response = await fetch(`${config.baseApi}${config.endpoints.uploadCsv}`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}

// UI Controller
class EmployeeUI {
  static async loadEmployees() {
    const tbody = document.querySelector('#employeesTable tbody');
    tbody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
    
    try {
      const employees = await EmployeeService.getAll();
      this.renderEmployees(employees);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8">Error al cargar empleados: ${error.message}</td></tr>`;
      utils.showMessage(`Error al cargar empleados: ${error.message}`, 'error');
    }
  }

  static renderEmployees(employees) {
    const tbody = document.querySelector('#employeesTable tbody');
    tbody.innerHTML = '';
    
    if (employees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No hay empleados registrados.</td></tr>';
      return;
    }

    employees.forEach((employee, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${employee.id ?? index + 1}</td>
        <td>${utils.escapeHtml(employee.Name)}</td>
        <td>${utils.escapeHtml(employee.Email)}</td>
        <td>${utils.escapeHtml(employee.Charge)}</td>
        <td>${utils.escapeHtml(employee.City)}</td>
        <td>${employee.Salary ?? ''}</td>
        <td>${employee.Age ?? ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="EmployeeApp.editEmployee(${employee.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="EmployeeApp.deleteEmployee(${employee.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  static resetForm() {
    document.getElementById('employeeForm').reset();
    document.getElementById('empId').value = '';
    document.getElementById('submitBtn').textContent = 'Crear Empleado';
  }

  static populateForm(employee) {
    document.getElementById('empId').value = employee.id;
    document.getElementById('Name').value = employee.Name || '';
    document.getElementById('Lastname').value = employee.Lastname || '';
    document.getElementById('Lastname2').value = employee.Lastname2 || '';
    document.getElementById('Email').value = employee.Email || '';
    document.getElementById('Charge').value = employee.Charge || '';
    document.getElementById('City').value = employee.City || '';
    document.getElementById('Salary').value = employee.Salary || '';
    document.getElementById('Age').value = employee.Age || '';
    document.getElementById('submitBtn').textContent = 'Actualizar Empleado';
  }

  static getFormData() {
    return {
      Name: document.getElementById('Name').value.trim(),
      Lastname: document.getElementById('Lastname').value.trim(),
      Lastname2: document.getElementById('Lastname2').value.trim(),
      Email: document.getElementById('Email').value.trim(),
      Charge: document.getElementById('Charge').value.trim(),
      City: document.getElementById('City').value.trim(),
      Salary: parseFloat(document.getElementById('Salary').value) || 0,
      Age: parseInt(document.getElementById('Age').value) || 0
    };
  }
}

// Main Application Controller
class EmployeeApp {
  static async init() {
    await EmployeeUI.loadEmployees();
    this.setupEventListeners();
    utils.showMessage('Aplicación iniciada correctamente', 'success');
  }

  static setupEventListeners() {
    // Form submit
    const form = document.getElementById('employeeForm');
    form.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
      EmployeeUI.resetForm();
    });

    // CSV upload
    document.getElementById('csvForm').addEventListener('submit', this.handleCsvUpload.bind(this));
  }

  static async handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('empId').value;
    const formData = EmployeeUI.getFormData();

    try {
      if (id) {
        await EmployeeService.update(id, formData);
        utils.showMessage('Empleado actualizado correctamente', 'success');
      } else {
        await EmployeeService.create(formData);
        utils.showMessage('Empleado creado correctamente', 'success');
      }
      
      EmployeeUI.resetForm();
      await EmployeeUI.loadEmployees();
    } catch (error) {
      utils.showMessage(`Error al guardar empleado: ${error.message}`, 'error');
    }
  }

  static async handleCsvUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('csvfile');
    
    if (!fileInput.files.length) {
      utils.showMessage('Selecciona un archivo CSV', 'error');
      return;
    }

    try {
      const result = await EmployeeService.uploadCsv(fileInput.files[0]);
      utils.showMessage(`CSV cargado correctamente. ${result.inserted} empleados insertados.`, 'success');
      fileInput.value = '';
      await EmployeeUI.loadEmployees();
    } catch (error) {
      utils.showMessage(`Error al cargar CSV: ${error.message}`, 'error');
    }
  }

  static async editEmployee(id) {
    try {
      const employees = await EmployeeService.getAll();
      const employee = employees.find(emp => emp.id == id);
      if (employee) {
        EmployeeUI.populateForm(employee);
        document.getElementById('Name').focus();
      }
    } catch (error) {
      utils.showMessage(`Error al cargar empleado: ${error.message}`, 'error');
    }
  }

  static async deleteEmployee(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await EmployeeService.delete(id);
        utils.showMessage('Empleado eliminado correctamente', 'success');
        await EmployeeUI.loadEmployees();
      } catch (error) {
        utils.showMessage(`Error al eliminar empleado: ${error.message}`, 'error');
      }
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  EmployeeApp.init();
});

// Make functions globally available for onclick handlers
window.EmployeeApp = EmployeeApp;

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
