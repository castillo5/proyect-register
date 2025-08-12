// public/main.js - Módulos ES6 con Vite

import { deletecustomer } from "../customerservice";

// Configuración de la API
const config = {
  baseApi: '/api',
  endpoints: {
    customer: '/customer',
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
class customerservice {
  static async getAll() {
    const response = await fetch(`${config.baseApi}${config.endpoints.customer}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async create(customer) {
    const response = await fetch(`${config.baseApi}${config.endpoints.customer}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async update(id, customer) {
    const response = await fetch(`${config.baseApi}${config.endpoints.customer}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async delete(id) {
    const response = await fetch(`${config.baseApi}${config.endpoints.customer}/${id}`, {
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
  static async loadcustomer() {
    const tbody = document.querySelector('#employeesTable tbody');
    tbody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
    
    try {
      const customer = await customerservice.getAll();
      this.renderEmployees(customer);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8">Error al cargar clientes: ${error.message}</td></tr>`;
      utils.showMessage(`Error al cargar clientes: ${error.message}`, 'error');
    }
  }

  static rendercustomer(customer) {
    const tbody = document.querySelector('#employeesTable tbody');
    tbody.innerHTML = '';
    
    if (customer.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No hay empleados registrados.</td></tr>';
      return;
    }

    customer.forEach((customer, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${customer.id ?? index + 1}</td>
        <td>${utils.escapeHtml(customer.Name)}</td>
        <td>${utils.escapeHtml(customer.Email)}</td>
        <td>${utils.escapeHtml(customer.Charge)}</td>
        <td>${utils.escapeHtml(customer.City)}</td>
        <td>${customer.Salary ?? ''}</td>
        <td>${customer.Age ?? ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="EmployeeApp.editEmployee(${customer.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="EmployeeApp.deleteEmployee(${customer.id})">
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
    document.getElementById('submitBtn').textContent = 'Creacion de clientes';
  }

  static populateForm(customer) {
    document.getElementById('empId').value = customer.id;
    document.getElementById('Name').value = customer.Name || '';
    document.getElementById('Lastname').value = customer.Lastname || '';
    document.getElementById('Lastname2').value = customer.Lastname2 || '';
    document.getElementById('Email').value = customer.Email || '';
    document.getElementById('Charge').value = customer.Charge || '';
    document.getElementById('City').value = customer.City || '';
    document.getElementById('Salary').value = customer.Salary || '';
    document.getElementById('Age').value = customer.Age || '';
    document.getElementById('submitBtn').textContent = 'Actualizar Empleado';
  }

  static getFormData() {
    return {
      first_name: document.getElementById('first_name').value.trim(),
      last_name: document.getElementById('last_name').value.trim(),
      active: document.getElementById('active').value.trim(),
    };
  }
}

// Main Application Controller
class customerApp {
  static async init() {
    await EmployeeUI.loadcustomer();
    this.setupEventListeners();
    utils.showMessage('Aplicación iniciada correctamente', 'success');
  }

  static setupEventListeners() {
    // Form submit
    const form = document.getElementById('employeeForm');
    form.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
      customerUI.resetForm();
    });

    // CSV upload
    document.getElementById('csvForm').addEventListener('submit', this.handleCsvUpload.bind(this));
  }

  static async handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('empId').value;
    const formData = customerUI.getFormData();

    try {
      if (id) {
        await customerService.update(id, formData);
        utils.showMessage('cliente actualizado correctamente', 'success');
      } else {
        await customerService.create(formData);
        utils.showMessage('cliente creado correctamente', 'success');
      }
      
      customerUI.resetForm();
      await customerUI.loadEmployees();
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
      const result = await customerService.uploadCsv(fileInput.files[0]);
      utils.showMessage(`CSV cargado correctamente. ${result.inserted} empleados insertados.`, 'success');
      fileInput.value = '';
      await customerUI.loadcustomer();
    } catch (error) {
      utils.showMessage(`Error al cargar CSV: ${error.message}`, 'error');
    }
  }

  static async editcustomer(id) {
    try {
      const customers = await customerService.getAll();
      const customer = customers.find(emp => emp.id == id);
      if (customer) {
        customerUI.populateForm(customer);
        document.getElementById('Name').focus();
      }
    } catch (error) {
      utils.showMessage(`Error al cargar cliente: ${error.message}`, 'error');
    }
  }

  static async deletecustomer(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await customerService.delete(id);
        utils.showMessage('Empleado eliminado correctamente', 'success');
        await customerUI.loadcustomer();
      } catch (error) {
        utils.showMessage(`Error al eliminar cliente: ${error.message}`, 'error');
      }
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  customerApp.init();
});

// Make functions globally available for onclick handlers
window.customerApp = customerApp;

function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function onSave(e) {
  e.preventDefault();
  const id = document.getElementById('empId').value;
  const payload = {
    first_name: document.getElementById('first_name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),  
    active: document.getElementById('active').value.trim(),
  };

  if (!payload.first_name || !payload.last_name) return alert('Name y Lastname son requeridos');

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${baseApi}/customer/${id}` : `${baseApi}/customer`;

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
  loadcustomer();
}

function resetForm(){
  document.getElementById('ID_customer').value = '';
  document.getElementById('customerForm').reset();
  document.getElementById('saveBtn').textContent = 'Guardar';
}

window.editcustomer = async function(id){
  const res = await fetch(`${baseApi}/customer/${id}`);
  if (!res.ok) return alert('No se pudo obtener clientes');
  const emp = await res.json();
  document.getElementById('first_name').value = emp.first_name;
  document.getElementById('last_name').value = emp.last_name || '';
  document.getElementById('active').value = emp.active || '';
};

window.deletecustomer = async function(id){
  if (!confirm('¿Eliminar este cliente?')) return;
  const res = await fetch(`${baseApi}/customer/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) return alert('Error: ' + (data.error || res.statusText));
  loadcustomer();
};
