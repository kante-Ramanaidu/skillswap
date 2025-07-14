function AuthFormInput({ label, type, name, value, onChange, placeholder }) {
  return (
    <div className="form-group" style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          fontSize: "1rem"
        }}
        required
      />
    </div>
  );
}

export default AuthFormInput;
