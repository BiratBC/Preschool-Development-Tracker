"use client"
import React, { useEffect, useState } from 'react';
import { Home, Users, Target, Settings, LogOut, Plus, Search, Bell, Menu, X, TrendingUp, Award, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';


export default function DashboardComponent() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentsData, setStudentsData] = useState<null | any>(null)
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    { 
      id: 1, 
      name: 'Emma Johnson', 
      avatar: 'EJ',
      progress: 75,
      totalGoals: 18,
      completedGoals: 14,
      lastUpdated: '2 hours ago',
      color: 'bg-purple-500'
    },
  ];

  const getStudentsData = async () => {
    try {
      const {data , error} = await supabase.from('students').select('*');
       setStudentsData(data);
       console.log(data);
      //  console.log("Test",studentsData[0]);
       
    } catch (error : any) {
      console.log(error);
      
    }
  }

  const stats = [
    { label: 'Total Students', value: '24', icon: Users, color: 'bg-blue-500', change: '+3 this month' },
    { label: 'Active Goals', value: '432', icon: Target, color: 'bg-purple-500', change: '18 students' },
    { label: 'Completed Today', value: '47', icon: Award, color: 'bg-green-500', change: '+12 from yesterday' },
    { label: 'Avg. Progress', value: '68%', icon: TrendingUp, color: 'bg-orange-500', change: '+5% this week' },
  ];
  const handleIndividualGoals = (id : Number) => {
      router.push(`/student/${id}`)
  }
  const handleLogout = () => {
    localStorage.setItem("adminId", "");
    router.push("/")
  }

  const addStudentPage = () => {
    router.push("/dashboard/addStudent");
  }

  useEffect(() => {
    getStudentsData();
  }, [])
  

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Tracker</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all">
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Students</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Target className="w-5 h-5" />
              <span className="font-medium">Goals & Milestones</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <button onClick={handleLogout}>
            <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                AD
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">admin@school.com</p>
              </div>
              <LogOut className="w-5 h-5 text-gray-400" />
            </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow" onClick={addStudentPage}>
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Student</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Students List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Students Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Track progress for all students</p>
              </div>
              <div className="p-6 space-y-4" onClick={() => {handleIndividualGoals(1)}}>
                {studentsData?.map((student: any) => (
                  <div key={student.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100">
                    <div className={`w-14 h-14 ${student.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {student.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{student?.full_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                            style={{width: `${student.progress}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{student.progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{student.completedGoals} of {student.totalGoals} goals completed</p>
                    </div>
                    <div className="text-right">
                      <Clock className="w-4 h-4 text-gray-400 inline mb-1" />
                      <p className="text-xs text-gray-500">{student.lastUpdated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

 
    </div>
  );
}