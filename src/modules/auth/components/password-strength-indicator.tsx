type Props = {
  password: string
}

export function PasswordStrengthIndicator({ password }: Props) {
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]

  return (
    <>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
        <div
          className={`h-1.5 rounded-full transition-all ${strengthColors[passwordStrength - 1] || "bg-gray-300"}`}
          style={{ width: `${(passwordStrength / 4) * 100}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Password strength: {strengthLabels[passwordStrength - 1] || "Too weak"}
      </p>
    </>
  )
}
