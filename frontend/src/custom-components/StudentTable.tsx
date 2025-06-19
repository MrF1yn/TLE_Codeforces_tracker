import React, { useEffect, useMemo, useState } from "react"
import { fetchStudents, type PaginatedResult } from "../lib/requests"
import { useStudentStore } from "../stores/useStudentStore"
import { Input } from "@/components/ui/input"
import {LayoutDashboard, Search} from "lucide-react"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { AddStudentFormModal } from "@/custom-components/AddStudentFormModal.tsx"
import {Download, Plus, MoreVertical, Eye, Edit, Trash2, Loader2, LinkIcon} from "lucide-react"
import {toast} from "sonner";
import axios from "axios";
import {EditStudentFormModal} from "@/custom-components/EditStudentFormModal.tsx";
import debounce from "lodash.debounce";
import {FloatingCard} from "@/custom-components/FloatingCard.tsx";
export default function StudentTable() {
    const {students} = useStudentStore();
    const {processes, setProcesses} = useStudentStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<PaginatedResult>({
        page: 1,
        totalPages: 1,
        total: 0
    })


    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) =>  {
        const searchTerm = e.target.value.toLowerCase();
        try {
            setLoading(true)
            const result = await fetchStudents(pagination.page, 10, searchTerm)
            setPagination(result)
        } catch (error) {
            console.error("Failed to fetch students:", error)
        } finally {
            setLoading(false)
        }
    }
    const debouncedResults = useMemo(() => {
        return debounce(handleChange, 300);
    }, []);

    useEffect(() => {
        return () => {
            debouncedResults.cancel();
        };
    });

    const loadStudents = async () => {
        try {
            setLoading(true)
            const result = await fetchStudents(pagination.page, 10)
            setPagination(result)
        } catch (error) {
            console.error("Failed to fetch students:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        loadStudents()
    }, [pagination.page])

    //fucntion to delete a student
    const deleteStudent = async (studentId: string) => {
        try {
            // Call your API to delete the student
            // await api.delete(`/students/${studentId}`)
            // Remove the student from the store
            const id = Date.now();
            setProcesses([...processes, {
                id: id,
                name: `Deleting Student with Id: ${studentId}`,
                progress: 50,
                status: 'active'
            }])
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/student/students/${studentId}`)
            setProcesses(processes.map(p => p.id === id ? {...p, progress: 100, status: 'completed'} : p))
            useStudentStore.getState().deleteStudent(studentId)
            toast.success("Student deleted successfully")
        } catch (error) {
            console.error("Failed to delete student:", error)
            toast.error("Failed to delete student")
        }
    }

    const downloadCSV = () => {
        const headers = ["Name", "Email", "Phone", "Handle", "Current", "Max"]
        const rows = students.map((s) => [
            s.name,
            s.email,
            s.phone,
            s.codeforcesHandle,
            s.currentRating,
            s.maxRating,
        ])
        const csvContent = [headers, ...rows]
            .map((e) => e.join(","))
            .join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = "students.csv"
        link.click()
    }

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }))
        }
    }

    return (
        <div className="space-y-6 px-4 md:px-6 min-h-screen">
            <FloatingCard delay={0}>
                    <div className="">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div
                                    className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                                    <LayoutDashboard
                                        className="w-8 h-8 md:w-12 md:h-12 text-black dark:text-white hover:rotate-45 transition"/>
                                </div>
                            </div>
                            <FloatingCard delay={100}>
                            <div>
                                <h1 className="text-lg md:text-4xl font-bold dark:text-white">System <span
                                    className={"text-primary"}>Dashboard</span></h1>
                                <p className="text-xs md:text-lg text-gray-600 dark:text-gray-300 mt-1">
                                    Manage enrolled students, track their progress, and analyze performance metrics
                                </p>
                            </div>
                            </FloatingCard>
                        </div>
                    </div>
            </FloatingCard>
            <FloatingCard delay={200}>
            <Card className={" border-border shadow-xl md:py-9 md:px-10 bg-secondary/10 dark:bg-card/30"}>
                <CardHeader>
                    <div className="flex sm:items-center sm:justify-between">

                        {/* Desktop Actions */}
                        <div className="hidden sm:flex gap-2 justify-end w-full">
                            <div className="relative mr-auto">
                                <Input
                                    type="text"
                                    placeholder="Search students..."
                                    className="h-9 pl-8 w-[200px]"
                                    onChange={debouncedResults}
                                />
                                <Search
                                    className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                            </div>
                            <Button
                                onClick={downloadCSV}
                                // variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4"/>
                                Download CSV
                            </Button>
                            <AddStudentFormModal>
                                <Button size="sm" className="flex items-center gap-2">
                                    <Plus className="h-4 w-4"/>
                                    Add Student
                                </Button>
                            </AddStudentFormModal>
                        </div>

                        {/* Mobile Actions Dropdown */}
                        <div className="sm:hidden ml-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MoreVertical className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={downloadCSV}>
                                        <Download className="h-4 w-4 mr-2"/>
                                        Download CSV
                                    </DropdownMenuItem>
                                    <AddStudentFormModal>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Plus className="h-4 w-4 mr-2"/>
                                            Add Student
                                        </DropdownMenuItem>
                                    </AddStudentFormModal>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="h-[calc(100vh-320px)] sm:h-[500px] md:h-[600px] lg:h-[400px] flex flex-col">
                    <div
                        className="rounded-lg border-border bg-secondary/20 dark:bg-card flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <Table className="rounded-lg text-md relative">
                                <TableHeader className={"rounded-lg  "}>
                                    <TableRow className={"rounded-lg  "}>
                                        <TableHead
                                            className="font-semibold p-3 rounded-tl-lg bg-secondary dark:bg-secondary">Name</TableHead>
                                        <TableHead
                                            className="font-semibold hidden md:table-cell bg-secondary dark:bg-secondary">Email</TableHead>
                                        <TableHead
                                            className="font-semibold hidden lg:table-cell bg-secondary dark:bg-secondary">Phone</TableHead>
                                        <TableHead
                                            className="font-semibold bg-secondary dark:bg-secondary">Handle</TableHead>
                                        <TableHead
                                            className="font-semibold text-center bg-secondary dark:bg-secondary">Current</TableHead>
                                        <TableHead
                                            className="font-semibold text-center hidden sm:table-cell bg-secondary dark:bg-secondary">Max</TableHead>
                                        <TableHead
                                            className="font-semibold hidden xl:table-cell bg-secondary dark:bg-secondary">Last
                                            Sync</TableHead>
                                        <TableHead
                                            className="font-semibold text-center rounded-tr-lg bg-secondary dark:bg-secondary">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="h-6 w-6 animate-spin mr-2"/>
                                                    Loading students...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                No students found. Add your first student to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student) => (
                                            <TableRow key={student.id}
                                                      className="hover:bg-secondary/50 font-semibold border-none">
                                                <TableCell className="p-3">
                                                    <div>
                                                        <div className="font-semibold">{student.name}</div>
                                                        <div className="text-sm text-muted-foreground md:hidden">
                                                            {student.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {student.email}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    {student.phone}
                                                </TableCell>
                                                <TableCell>
                                                    <a className="bg-primary hover:text-muted text-white dark:bg-secondary px-2 py-1 rounded text-sm items-center justify-center inline-flex gap-1"
                                                       href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                                       target={"_blank"} rel="noopener noreferrer"
                                                    >
                                                    <span
                                                        className={"font-semibold hover:underline  "}
                                                    >{student.codeforcesHandle}</span>
                                                        <LinkIcon className="inline h-4 w-4 mr-1"/>
                                                    </a>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {student.currentRating}
                                                </span>
                                                </TableCell>
                                                <TableCell className="text-center hidden sm:table-cell">
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    {student.maxRating}
                                                </span>
                                                </TableCell>
                                                <TableCell
                                                    className="hidden xl:table-cell text-sm text-muted-foreground">
                                                    {new Date(student.lastSyncedAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Desktop Actions */}
                                                        <div className="hidden sm:flex gap-1 text-muted">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => navigate(`/students/${student.id}`)}
                                                                className="h-8 px-2"
                                                            >
                                                                <Eye className="h-3 w-3"/>
                                                            </Button>
                                                            <EditStudentFormModal student={student}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2"
                                                                >
                                                                    <Edit className="h-3 w-3"/>
                                                                </Button>
                                                            </EditStudentFormModal>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 px-2 hover:text-red-600 "
                                                                onClick={() => deleteStudent(student.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3"/>
                                                            </Button>
                                                        </div>

                                                        {/* Mobile Actions Dropdown */}
                                                        <div className="sm:hidden">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm"
                                                                            className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4"/>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => navigate(`/students/${student.id}`)}
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-2"/>
                                                                        View
                                                                    </DropdownMenuItem>
                                                                    <EditStudentFormModal student={student}>
                                                                        <DropdownMenuItem
                                                                            onSelect={(e) => e.preventDefault()}>
                                                                            <Edit className="h-4 w-4 mr-2"/>
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                    </EditStudentFormModal>
                                                                    <DropdownMenuItem className="text-destructive"
                                                                                      onClick={() => deleteStudent(student.id)}>
                                                                        <Trash2 className="h-4 w-4 mr-2"/>
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>

                {pagination.totalPages > 1 && (
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            Showing page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
            </FloatingCard>
        </div>
    )
}