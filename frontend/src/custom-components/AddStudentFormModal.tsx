// 📁 File: src/components/StudentFormModal.tsx
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {useState} from "react"
import axios from "axios";
import {toast} from "sonner";
import {useStudentStore} from "@/stores/useStudentStore.tsx";
import {mapToStudent} from "@/lib/requests.ts";
type StudentFormModalProps = {
    children?: React.ReactNode
}

export function AddStudentFormModal({children}: StudentFormModalProps) {

    // const addStudent = useStudentStore((s) => s.addStudent)

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({name: '', email: '', phone: '', codeforcesHandle: ''})
    const {processes, setProcesses, addStudent} = useStudentStore()
    const handleSubmit = async () => {
        //do a axios post request to the backend
        if (!form.name || !form.codeforcesHandle) {
            toast("All Fields are required", {
                // description: "Sunday, December 03, 2023 at 9:00 AM",
                // action: {
                //     label: "Undo",
                //     onClick: () => console.log("Undo"),
                // },
            })
            return
        }


        try {
            const id = Date.now();
            setProcesses([...processes, {
                id: id,
                name: `Adding ${form.name}`,
                progress: 50,
                status: 'active'
            }])
            setForm({name: '', email: '', phone: '', codeforcesHandle: ''})
            setOpen(false)
            toast(`Adding ${form.name}`, {
                description: "This may take a few seconds",
            })
            const response = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/student/students", {
                email: form.email,
                name: form.name,
                codeforcesHandle: form.codeforcesHandle
            })
            addStudent(mapToStudent(response.data.data))
            setProcesses(processes.map(p => p.id === id ? {...p, progress: 100, status: 'completed'} : p))

        } catch (error) {
            toast.error("Failed to add student")
        }


        setForm({name: '', email: '', phone: '', codeforcesHandle: ''})
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button variant="outline">Add Student</Button>}
            </DialogTrigger>
            <DialogContent className={"bg-card"}>
                <DialogTitle>Add Student</DialogTitle>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name <span className="text-primary">*</span>
                            </label>
                            <Input
                                id="name"
                                placeholder="Name"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cfHandle" className="text-sm font-medium">
                                CF Handle <span className="text-primary">*</span>
                            </label>
                            <Input
                                id="cfHandle"
                                placeholder="CF Handle"
                                value={form.codeforcesHandle}
                                onChange={(e) => setForm({...form, codeforcesHandle: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email (Optional)</label>
                        <Input
                            id="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone (Optional)</label>
                        <Input
                            id="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) => setForm({...form, phone: e.target.value})}
                        />
                    </div>

                    <Button className="w-full mt-4" onClick={handleSubmit}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}