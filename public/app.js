function $(selector, root = document) {
	return root.querySelector(selector);
}

function showFormError(form, message) {
	const box = $('.form-error', form);
	if (!box) return;
	box.textContent = String(message || 'Please check your inputs.');
	box.hidden = false;
}

function clearFormError(form) {
	const box = $('.form-error', form);
	if (box) {
		box.textContent = '';
		box.hidden = true;
	}
	form.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
}

function markError(el) {
	if (el) el.classList.add('input-error');
}

function isoToday() {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

function initSignup() {
	const form = $('#signup-form');
	if (!form) return;

	const password = $('input[name="password"]', form);
	const confirmPassword = $('input[name="confirmPassword"]', form);

	form.addEventListener('input', () => clearFormError(form));
	form.addEventListener('submit', (e) => {
		clearFormError(form);

		const pw = password?.value ?? '';
		const cpw = confirmPassword?.value ?? '';

		if (pw.length < 6) {
			e.preventDefault();
			markError(password);
			showFormError(form, 'Password must be at least 6 characters.');
			password?.focus();
			return;
		}

		if (pw !== cpw) {
			e.preventDefault();
			markError(confirmPassword);
			showFormError(form, 'Passwords do not match.');
			confirmPassword?.focus();
		}
	});
}

function initLeaveForm() {
	const form = $('#leave-form');
	if (!form) return;

	const start = $('input[name="startDate"]', form);
	const end = $('input[name="endDate"]', form);

	// Helpful defaults: don't allow past dates (still validated on backend)
	const today = isoToday();
	if (start && !start.min) start.min = today;
	if (end && !end.min) end.min = today;

	form.addEventListener('input', () => clearFormError(form));
	form.addEventListener('submit', (e) => {
		clearFormError(form);

		const s = start?.value;
		const en = end?.value;
		if (!s || !en) return;

		if (en < s) {
			e.preventDefault();
			markError(end);
			showFormError(form, 'End date must be the same as or after the start date.');
			end?.focus();
		}
	});
}

function initGenericForms() {
	const forms = ['#login-form', '#admin-login-form'];
	for (const sel of forms) {
		const form = $(sel);
		if (!form) continue;
		form.addEventListener('input', () => clearFormError(form));
	}
}

document.addEventListener('DOMContentLoaded', () => {
	initSignup();
	initLeaveForm();
	initGenericForms();
});
