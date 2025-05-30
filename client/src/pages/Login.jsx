import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { Loader } from "lucide-react"

function Login() {
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message)

            localStorage.setItem("token", result.token)

            toast.success("Login successful! Redirecting...")

            setTimeout(() => {
                navigate("/")
            }, 1500)
        } catch (err) {
            toast.error(err.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-background">
            <Card className="w-full max-w-sm p-4">
                <CardContent>
                    <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input placeholder="Username" {...register("username", { required: true })} />
                        <Input type="password" placeholder="Password" {...register("password", { required: true })} />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader className="animate-spin size-4" />
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </form>

                    <p className="text-sm text-center mt-4">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-primary underline">Sign up</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login
