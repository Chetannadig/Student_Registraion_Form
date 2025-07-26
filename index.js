       // Student Registration System JavaScript
        // This script handles all functionality for managing student records

        // Class to handle student data and operations
        class StudentManager {
            constructor() {
                // Initialize students array from localStorage
                this.students = this.loadStudentsFromStorage();
                this.currentEditId = null; // Track which student is being edited
                this.initializeEventListeners();
                this.renderStudents();
            }

            // Load students from localStorage
            loadStudentsFromStorage() {
                try {
                    const storedStudents = localStorage.getItem('studentRecords');
                    return storedStudents ? JSON.parse(storedStudents) : [];
                } catch (error) {
                    console.error('Error loading students from storage:', error);
                    return [];
                }
            }

            // Save students to localStorage
            saveStudentsToStorage() {
                try {
                    localStorage.setItem('studentRecords', JSON.stringify(this.students));
                } catch (error) {
                    console.error('Error saving students to storage:', error);
                    this.showMessage('Error saving data. Please try again.', 'error');
                }
            }

            // Initialize all event listeners
            initializeEventListeners() {
                const form = document.getElementById('studentForm');
                const cancelBtn = document.getElementById('cancelBtn');

                // Form submission handler
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmission();
                });

                // Cancel edit handler
                cancelBtn.addEventListener('click', () => {
                    this.cancelEdit();
                });

                // Real-time validation for input fields
                this.setupRealTimeValidation();
            }

            // Setup real-time validation for all input fields
            setupRealTimeValidation() {
                const inputs = document.querySelectorAll('.form-input');
                
                inputs.forEach(input => {
                    // Validate on blur (when user leaves the field)
                    input.addEventListener('blur', () => {
                        this.validateField(input);
                    });

                    // Clear error on focus
                    input.addEventListener('focus', () => {
                        this.clearFieldError(input);
                    });
                });

                // Special handling for student ID and contact number (numbers only)
                document.getElementById('studentId').addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                });

                document.getElementById('contactNumber').addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                });

                // Special handling for student name (letters and spaces only)
                document.getElementById('studentName').addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                });
            }

            // Validate individual field
            validateField(field) {
                const value = field.value.trim();
                const fieldName = field.name;
                let isValid = true;
                let errorMessage = '';

                // Check if field is empty
                if (!value) {
                    isValid = false;
                    errorMessage = `${this.getFieldDisplayName(fieldName)} is required.`;
                } else {
                    // Field-specific validation
                    switch (fieldName) {
                        case 'studentName':
                            if (!/^[a-zA-Z\s]{2,50}$/.test(value)) {
                                isValid = false;
                                errorMessage = 'Name must contain only letters and spaces (2-50 characters).';
                            }
                            break;

                        case 'studentId':
                            if (!/^\d+$/.test(value)) {
                                isValid = false;
                                errorMessage = 'Student ID must contain only numbers.';
                            } else if (this.isStudentIdExists(value, this.currentEditId)) {
                                isValid = false;
                                errorMessage = 'This Student ID already exists.';
                            }
                            break;

                        case 'emailId':
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(value)) {
                                isValid = false;
                                errorMessage = 'Please enter a valid email address.';
                            } else if (this.isEmailExists(value, this.currentEditId)) {
                                isValid = false;
                                errorMessage = 'This email address is already registered.';
                            }
                            break;

                        case 'contactNumber':
                            if (!/^\d{10,}$/.test(value)) {
                                isValid = false;
                                errorMessage = 'Contact number must be at least 10 digits.';
                            } else if (this.isContactExists(value, this.currentEditId)) {
                                isValid = false;
                                errorMessage = 'This contact number is already registered.';
                            }
                            break;
                    }
                }

                // Show/hide error message
                if (isValid) {
                    this.clearFieldError(field);
                } else {
                    this.showFieldError(field, errorMessage);
                }

                return isValid;
            }

            // Get display name for field
            getFieldDisplayName(fieldName) {
                const displayNames = {
                    'studentName': 'Student Name',
                    'studentId': 'Student ID',
                    'emailId': 'Email Address',
                    'contactNumber': 'Contact Number'
                };
                return displayNames[fieldName] || fieldName;
            }

            // Check if student ID already exists
            isStudentIdExists(studentId, excludeId = null) {
                return this.students.some(student => 
                    student.studentId === studentId && student.id !== excludeId
                );
            }

            // Check if email already exists
            isEmailExists(email, excludeId = null) {
                return this.students.some(student => 
                    student.emailId.toLowerCase() === email.toLowerCase() && student.id !== excludeId
                );
            }

            // Check if contact number already exists
            isContactExists(contact, excludeId = null) {
                return this.students.some(student => 
                    student.contactNumber === contact && student.id !== excludeId
                );
            }

            // Show field error
            showFieldError(field, message) {
                field.classList.add('error');
                const errorElement = document.getElementById(`${field.name}-error`);
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                }
            }

            // Clear field error
            clearFieldError(field) {
                field.classList.remove('error');
                const errorElement = document.getElementById(`${field.name}-error`);
                if (errorElement) {
                    errorElement.style.display = 'none';
                    errorElement.textContent = '';
                }
            }

            // Validate entire form
            validateForm() {
                const fields = document.querySelectorAll('.form-input');
                let isFormValid = true;

                fields.forEach(field => {
                    if (!this.validateField(field)) {
                        isFormValid = false;
                    }
                });

                return isFormValid;
            }

            // Handle form submission
            handleFormSubmission() {
                // Show loading state
                this.setLoadingState(true);

                // Simulate processing delay (like a real application)
                setTimeout(() => {
                    if (this.validateForm()) {
                        const formData = this.getFormData();
                        
                        if (this.currentEditId) {
                            this.updateStudent(this.currentEditId, formData);
                        } else {
                            this.addStudent(formData);
                        }
                    }
                    
                    this.setLoadingState(false);
                }, 500);
            }

            // Get form data
            getFormData() {
                return {
                    studentName: document.getElementById('studentName').value.trim(),
                    studentId: document.getElementById('studentId').value.trim(),
                    emailId: document.getElementById('emailId').value.trim(),
                    contactNumber: document.getElementById('contactNumber').value.trim()
                };
            }

            // Add new student
            addStudent(studentData) {
                const newStudent = {
                    id: Date.now(), // Simple ID generation using timestamp
                    ...studentData,
                    createdAt: new Date().toISOString()
                };

                this.students.push(newStudent);
                this.saveStudentsToStorage();
                this.renderStudents();
                this.resetForm();
                this.showMessage('Student registered successfully! 🎉', 'success');
            }

            // Update existing student
            updateStudent(id, studentData) {
                const studentIndex = this.students.findIndex(student => student.id === id);
                
                if (studentIndex !== -1) {
                    this.students[studentIndex] = {
                        ...this.students[studentIndex],
                        ...studentData,
                        updatedAt: new Date().toISOString()
                    };
                    
                    this.saveStudentsToStorage();
                    this.renderStudents();
                    this.resetForm();
                    this.showMessage('Student information updated successfully! ✅', 'success');
                }
            }

            // Delete student
            deleteStudent(id) {
                // Confirm deletion
                if (confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
                    this.students = this.students.filter(student => student.id !== id);
                    this.saveStudentsToStorage();
                    this.renderStudents();
                    this.showMessage('Student record deleted successfully.', 'success');
                }
            }

            // Edit student
            editStudent(id) {
                const student = this.students.find(student => student.id === id);
                
                if (student) {
                    // Populate form with student data
                    document.getElementById('studentName').value = student.studentName;
                    document.getElementById('studentId').value = student.studentId;
                    document.getElementById('emailId').value = student.emailId;
                    document.getElementById('contactNumber').value = student.contactNumber;

                    // Update UI for edit mode
                    this.currentEditId = id;
                    document.getElementById('formTitle').textContent = '✏️ Edit Student Information';
                    document.getElementById('submitText').textContent = 'Update Student';
                    document.getElementById('cancelBtn').style.display = 'inline-block';

                    // Scroll to form
                    document.querySelector('.form-section').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }

            // Cancel edit mode
            cancelEdit() {
                this.currentEditId = null;
                this.resetForm();
                document.getElementById('formTitle').textContent = '📝 Register New Student';
                document.getElementById('submitText').textContent = 'Register Student';
                document.getElementById('cancelBtn').style.display = 'none';
            }

            // Reset form
            resetForm() {
                document.getElementById('studentForm').reset();
                
                // Clear all error states
                const fields = document.querySelectorAll('.form-input');
                fields.forEach(field => {
                    this.clearFieldError(field);
                });
            }

            // Set loading state
            setLoadingState(isLoading) {
                const submitBtn = document.getElementById('submitBtn');
                const submitText = document.getElementById('submitText');
                const submitLoading = document.getElementById('submitLoading');

                if (isLoading) {
                    submitBtn.disabled = true;
                    submitText.style.display = 'none';
                    submitLoading.style.display = 'inline-block';
                } else {
                    submitBtn.disabled = false;
                    submitText.style.display = 'inline';
                    submitLoading.style.display = 'none';
                }
            }

            // Render students table
            renderStudents() {
                const tableBody = document.getElementById('studentsTableBody');
                const emptyState = document.getElementById('emptyState');
                const recordsContainer = document.querySelector('.records-container');

                // Clear existing content
                tableBody.innerHTML = '';

                if (this.students.length === 0) {
                    // Show empty state
                    emptyState.style.display = 'block';
                    recordsContainer.style.display = 'none';
                } else {
                    // Hide empty state and show table
                    emptyState.style.display = 'none';
                    recordsContainer.style.display = 'block';

                    // Render each student
                    this.students.forEach(student => {
                        const row = this.createStudentRow(student);
                        tableBody.appendChild(row);
                    });

                    // Update scrollbar visibility dynamically
                    this.updateScrollbar();
                }
            }

            // Create student table row
            createStudentRow(student) {
                const row = document.createElement('tr');
                row.classList.add('fade-in');
                
                row.innerHTML = `
                    <td>${this.escapeHtml(student.studentName)}</td>
                    <td>${this.escapeHtml(student.studentId)}</td>
                    <td>${this.escapeHtml(student.emailId)}</td>
                    <td>${this.escapeHtml(student.contactNumber)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-small" onclick="studentManager.editStudent(${student.id})" aria-label="Edit student">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-danger btn-small" onclick="studentManager.deleteStudent(${student.id})" aria-label="Delete student">
                                🗑️ Delete
                            </button>
                        </div>
                    </td>
                `;

                return row;
            }

            // Escape HTML to prevent XSS
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            // Update scrollbar visibility
            updateScrollbar() {
                const container = document.querySelector('.records-container');
                const table = document.querySelector('.records-table');
                
                // Check if content overflows and show/hide scrollbar accordingly
                if (table.scrollHeight > container.clientHeight) {
                    container.style.overflowY = 'scroll';
                } else {
                    container.style.overflowY = 'hidden';
                }
            }

            // Show success/error messages
            showMessage(message, type) {
                const messageContainer = document.getElementById('messageContainer');
                
                // Remove existing messages
                messageContainer.innerHTML = '';
                
                // Create new message
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${type} fade-in`;
                messageDiv.textContent = message;
                
                messageContainer.appendChild(messageDiv);
                messageDiv.style.display = 'block';

                // Auto-hide message after 5 seconds
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }
        }

        // Initialize the Student Management System when page loads
        let studentManager;

        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the student manager
            studentManager = new StudentManager();
            
            console.log('Student Registration System initialized successfully! 🎓');
        });

        // Handle page resize for responsive scrollbar
        window.addEventListener('resize', function() {
            if (studentManager) {
                studentManager.updateScrollbar();
            }
        });