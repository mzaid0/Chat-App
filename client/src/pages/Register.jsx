import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Loader, Eye, EyeOff } from "lucide-react";
import api from "@/api/axios-instance"; 
import useAuthStore from "@/store/useAuthStore"; 

function Register() {
  const { register, handleSubmit, control } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      setUser(res.data.user, res.data.token); // Assuming API returns user object and token
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-background">
      <Card className="w-full max-w-sm p-4">
        <CardContent>
          <h2 className="text-xl font-semibold text-center mb-4">Register</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Full Name" {...register("fullname", { required: true })} />
            <Input placeholder="Username" {...register("username", { required: true })} />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="pr-10"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
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
  );
}

export default Register;