import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isChecked) {
      setErrorMsg("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    try {
      await register({
        ced_usu: formData.cedula,
        nom_usu: `${formData.nombre} ${formData.apellido}`.trim(),
        ema_usu: formData.email,
        cla_usu: formData.password,
        rol_usu: 2, // Rol por defecto (Usuario)
        sta_usu: 1, // Activo por defecto
      });
      navigate("/signin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Botón "Volver al dashboard" */}
      <div className="mb-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5 mr-1" />
          Volver al panel principal
        </Link>
      </div>

      {/* Sección de Título y Subtítulo */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
          Registrarse
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          ¡Introduce tus datos para crear una cuenta!
        </p>
      </div>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {errorMsg && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Cédula */}
          <div>
            <Label>
              Cédula de Identidad<span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Ej: 12345678"
              value={formData.cedula}
              onChange={(e) => handleInputChange("cedula", e.target.value)}
              required
            />
          </div>

          {/* Campos de Nombre y Apellido */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                Nombre<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Introduce tu nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>
                Apellido<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Introduce tu apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label>
              Correo electrónico<span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="Introduce tu correo"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label>
              Contraseña<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Introduce tu contraseña"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeIcon className="size-5" />
                ) : (
                  <EyeCloseIcon className="size-5" />
                )}
              </span>
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="flex items-start gap-3">
            <Checkbox
              className="w-5 h-5 mt-1"
              checked={isChecked}
              onChange={setIsChecked}
            />
            <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-sm">
              Al crear una cuenta, aceptas nuestros{" "}
              <span className="font-medium text-gray-800 dark:text-white/90 underline cursor-pointer">
                Términos y condiciones
              </span>{" "}
              y nuestra{" "}
              <span className="font-medium text-gray-800 dark:text-white underline cursor-pointer">
                Política de privacidad
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 text-sm rounded-xl transition-all"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </div>
        </div>
      </form>

      {/* Link to Login */}
      <div className="mt-8">
        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
          ¿Ya tienes una cuenta? {""}
          <Link
            to="/signin"
            className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}