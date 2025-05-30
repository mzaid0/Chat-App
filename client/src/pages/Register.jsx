import { useForm, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { Loader } from "lucide-react"

function Register() {
    const { register, handleSubmit, control } = useForm()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message)

            localStorage.setItem("token", result.token)

            toast.success("Registration successful! Redirecting to login...")

            setTimeout(() => {
                navigate("/login")
            }, 1500)
        } catch (err) {
            toast.error(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-background">
            <Card className="w-full max-w-sm p-4">
                <CardContent>
                    <h2 className="text-xl font-semibold text-center mb-4">Register</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input placeholder="Full Name" {...register("fullname", { required: true })} />
                        <Input placeholder="Username" {...register("username", { required: true })} />
                        <Input type="password" placeholder="Password" {...register("password", { required: true })} />

                        <Controller
                            name="gender"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader className="animate-spin size-4" />
                                    Registering...
                                </span>
                            ) : (
                                "Register"
                            )}
                        </Button>
                    </form>

                    <p className="text-sm text-center mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary underline">Login</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register
