import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

function Home() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8080/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })

            localStorage.removeItem("token")
            toast.success("Logged out successfully!")
            navigate("/login")
        } catch (error) {
            console.error("Logout error:", error)
            toast.error("Logout failed")
        }
    }

    return (
        <div className="min-h-screen flex flex-col gap-4 justify-center items-center">
            <h1 className="text-2xl font-bold">Welcome to the Home Page 🎉</h1>
            <Button variant="destructive" onClick={handleLogout}>
                Logout
            </Button>
        </div>
    )
}

export default Home
