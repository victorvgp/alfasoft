export function validateContact({ name, contact, email }, isUpdate = false) {
  const errors = {};

  if (!name || name.trim().length <= 5) {
    errors.name = "Name must have more than 5 characters";
  }

  if (!contact || !/^\d{9}$/.test(contact)) {
    errors.contact = "Contact must contain exactly 9 digits";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email address";
  }

  return Object.keys(errors).length ? errors : null;
}
