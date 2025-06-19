// 📁 File: src/components/StudentFormModal.tsx
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {useState} from "react"
import axios from "axios";
import {toast} from "sonner";
import {type Student, useStudentStore} from "@/stores/useStudentStore.tsx";
import {mapToStudent} from "@/lib/requests.ts";
type StudentFormModalProps = {
    children?: React.ReactNode
    student: Student
}

export function EditStudentFormModal({children, student}: StudentFormModalProps) {

    // const addStudent = useStudentStore((s) => s.addStudent)
    console.log("student", student)
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({name: student.name, email: student.email, phone: student.phone as string, codeforcesHandle: student.codeforcesHandle})
    const {processes, setProcesses, updateStudent} = useStudentStore()
    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.codeforcesHandle) {
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
                name: `Editing ${form.name}`,
                progress: 50,
                status: 'active'
            }])
            setForm({name: '', email: '', phone: '', codeforcesHandle: ''})
            setOpen(false)
            toast(`Editing ${form.name}`, {
                description: "This may take a few seconds",
            })
            let response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/student/students/${student.id}/update`, {
                email: form.email,
                name: form.name,
                // codeforcesHandle: form.codeforcesHandle
                phoneNumber: form.phone,
            })
            //check if the codeforecesHandle has changed
            if (form.codeforcesHandle && form.codeforcesHandle !== student.codeforcesHandle) {
                toast(`Updating Codeforces Handle for ${form.name}`, {
                    description: "This may take a few seconds",
                });
                response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/student/students/${student.id}/codeforces`, {
                    codeforcesHandle: form.codeforcesHandle
                })
            }
            updateStudent(student.id, mapToStudent(response.data.data))
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
                {children || <Button variant="outline">Edit Student</Button>}
            </DialogTrigger>
            <DialogContent className={"bg-card"}>
                <DialogTitle>Edit Student</DialogTitle>
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name <span className="text-primary">*</span>
                            </label>
                            <Input
                                id="name"
                                placeholder="Name"
                                value={form.name}
                                defaultValue={student.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label htmlFor="cfHandle" className="text-sm font-medium">
                                CF Handle <span className="text-primary">*</span>
                            </label>
                            <Input
                                id="cfHandle"
                                placeholder="CF Handle"
                                value={form.codeforcesHandle}
                                defaultValue={student.codeforcesHandle}
                                onChange={(e) => setForm({...form, codeforcesHandle: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email (Optional)
                        </label>
                        <Input
                            id="email"
                            placeholder="Email"
                            value={form.email}
                            defaultValue={student.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                            Phone (Optional)
                        </label>
                        <Input
                            id="phone"
                            placeholder="Phone"
                            value={form.phone}
                            defaultValue={student.phone as string}
                            onChange={(e) => setForm({...form, phone: e.target.value})}
                        />
                    </div>

                    <Button className="w-full mt-2" onClick={handleSubmit}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}