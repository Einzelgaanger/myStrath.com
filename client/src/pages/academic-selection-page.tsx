import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AcademicHierarchy, AcademicSelection } from "@shared/client-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// API functions
const fetchCountries = async (): Promise<AcademicHierarchy[]> => {
  try {
    console.log('Fetching countries from API...');
    const response = await fetch('/api/academic/countries');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', response.status, errorText);
      throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Countries API response:', result);
    
    if (!result.data || !Array.isArray(result.data)) {
      console.error('Invalid response format:', result);
      return [];
    }
    
    return result.data.map((item: any) => ({
      id: item.id,
      type: 'country',
      name: item.name,
      code: item.code,
      parentId: null,
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

const fetchUniversities = async (countryId: string): Promise<AcademicHierarchy[]> => {
  try {
    console.log('Fetching universities for country:', countryId);
    const response = await fetch(`/api/academic/universities/${countryId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', response.status, errorText);
      throw new Error(`Failed to fetch universities: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Universities API response:', result);
    
    if (!result.data || !Array.isArray(result.data)) {
      console.error('Invalid response format:', result);
      return [];
    }
    
    return result.data.map((item: any) => ({
      id: item.id,
      type: 'university',
      name: item.name,
      code: item.code,
      parentId: countryId,
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
};

const fetchPrograms = async (universityId: number): Promise<AcademicHierarchy[]> => {
  const response = await fetch(`/api/academic/programs/${universityId}`);
  if (!response.ok) throw new Error("Failed to fetch programs");
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id,
    type: "program",
    name: item.name,
    code: item.code,
    parentId: universityId,
    createdAt: new Date()
  }));
};

const fetchCourses = async (programId: number): Promise<AcademicHierarchy[]> => {
  const response = await fetch(`/api/academic/courses/${programId}`);
  if (!response.ok) throw new Error("Failed to fetch courses");
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id,
    type: "course",
    name: item.name,
    code: item.code,
    parentId: programId,
    createdAt: new Date()
  }));
};

const fetchYears = async (courseId: number): Promise<AcademicHierarchy[]> => {
  const response = await fetch(`/api/academic/years/${courseId}`);
  if (!response.ok) throw new Error("Failed to fetch years");
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id,
    type: "year",
    name: item.name,
    code: item.code,
    parentId: courseId,
    createdAt: new Date()
  }));
};

const fetchSemesters = async (yearId: number): Promise<AcademicHierarchy[]> => {
  const response = await fetch(`/api/academic/semesters/${yearId}`);
  if (!response.ok) throw new Error("Failed to fetch semesters");
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id,
    type: "semester",
    name: item.name,
    code: item.code,
    parentId: yearId,
    createdAt: new Date()
  }));
};

const fetchGroups = async (semesterId: number): Promise<AcademicHierarchy[]> => {
  const response = await fetch(`/api/academic/groups/${semesterId}`);
  if (!response.ok) throw new Error("Failed to fetch groups");
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id,
    type: "group",
    name: item.name,
    code: item.code,
    parentId: semesterId,
    createdAt: new Date()
  }));
};

export default function AcademicSelectionPage() {
  const [, navigate] = useLocation();
  const [selection, setSelection] = useState<Partial<AcademicSelection>>({});

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });

  // Fetch universities based on country selection
  const { data: universities = [] } = useQuery({
    queryKey: ["universities", selection.countryId],
    queryFn: () => fetchUniversities(selection.countryId!),
    enabled: !!selection.countryId,
  });

  // Fetch programs based on university selection
  const { data: programs = [] } = useQuery({
    queryKey: ["programs", selection.universityId],
    queryFn: () => fetchPrograms(selection.universityId!),
    enabled: !!selection.universityId,
  });

  // Fetch courses based on program selection
  const { data: courses = [] } = useQuery({
    queryKey: ["courses", selection.programId],
    queryFn: () => fetchCourses(selection.programId!),
    enabled: !!selection.programId,
  });

  // Fetch years based on course selection
  const { data: years = [] } = useQuery({
    queryKey: ["years", selection.courseId],
    queryFn: () => fetchYears(selection.courseId!),
    enabled: !!selection.courseId,
  });

  // Fetch semesters based on year selection
  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters", selection.yearId],
    queryFn: () => fetchSemesters(selection.yearId!),
    enabled: !!selection.yearId,
  });

  // Fetch groups based on semester selection
  const { data: groups = [] } = useQuery({
    queryKey: ["groups", selection.semesterId],
    queryFn: () => fetchGroups(selection.semesterId!),
    enabled: !!selection.semesterId,
  });

  // Check if form is complete
  const isFormComplete = !!(
    selection.countryId &&
    selection.universityId &&
    selection.programId &&
    selection.courseId &&
    selection.yearId &&
    selection.semesterId &&
    selection.groupId
  );

  // Handle selection changes
  const handleCountryChange = (value: string) => {
    setSelection({
      countryId: parseInt(value),
      universityId: undefined,
      programId: undefined,
      courseId: undefined,
      yearId: undefined,
      semesterId: undefined,
      groupId: undefined,
    });
  };

  const handleUniversityChange = (value: string) => {
    setSelection({
      ...selection,
      universityId: parseInt(value),
      programId: undefined,
      courseId: undefined,
      yearId: undefined,
      semesterId: undefined,
      groupId: undefined,
    });
  };

  const handleProgramChange = (value: string) => {
    setSelection({
      ...selection,
      programId: parseInt(value),
      courseId: undefined,
      yearId: undefined,
      semesterId: undefined,
      groupId: undefined,
    });
  };

  const handleCourseChange = (value: string) => {
    setSelection({
      ...selection,
      courseId: parseInt(value),
      yearId: undefined,
      semesterId: undefined,
      groupId: undefined,
    });
  };

  const handleYearChange = (value: string) => {
    setSelection({
      ...selection,
      yearId: parseInt(value),
      semesterId: undefined,
      groupId: undefined,
    });
  };

  const handleSemesterChange = (value: string) => {
    setSelection({
      ...selection,
      semesterId: parseInt(value),
      groupId: undefined,
    });
  };

  const handleGroupChange = (value: string) => {
    setSelection({
      ...selection,
      groupId: parseInt(value),
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormComplete) {
      // Save selection to session storage with names for display
      const selectedCountry = countries.find(c => c.id === selection.countryId);
      const selectedUniversity = universities.find(u => u.id === selection.universityId);
      const selectedProgram = programs.find(p => p.id === selection.programId);
      const selectedCourse = courses.find(c => c.id === selection.courseId);
      const selectedYear = years.find(y => y.id === selection.yearId);
      const selectedSemester = semesters.find(s => s.id === selection.semesterId);
      const selectedGroup = groups.find(g => g.id === selection.groupId);

      const fullSelection = {
        ...selection,
        countryName: selectedCountry?.name,
        universityName: selectedUniversity?.name,
        programName: selectedProgram?.name,
        courseName: selectedCourse?.name,
        yearName: selectedYear?.name,
        semesterName: selectedSemester?.name,
        groupName: selectedGroup?.name
      };

      sessionStorage.setItem("academicSelection", JSON.stringify(fullSelection));
      // Navigate to auth page
      navigate("/auth");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Academic Selection</CardTitle>
          <CardDescription>
            Please select your academic program details to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select
                value={selection.countryId?.toString()}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* University Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">University</label>
              <Select
                value={selection.universityId?.toString()}
                onValueChange={handleUniversityChange}
                disabled={!selection.countryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id.toString()}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Program</label>
              <Select
                value={selection.programId?.toString()}
                onValueChange={handleProgramChange}
                disabled={!selection.universityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select
                value={selection.courseId?.toString()}
                onValueChange={handleCourseChange}
                disabled={!selection.programId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={selection.yearId?.toString()}
                onValueChange={handleYearChange}
                disabled={!selection.courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select
                value={selection.semesterId?.toString()}
                onValueChange={handleSemesterChange}
                disabled={!selection.yearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id.toString()}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Group Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Group</label>
              <Select
                value={selection.groupId?.toString()}
                onValueChange={handleGroupChange}
                disabled={!selection.semesterId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={!isFormComplete} className="w-full">
              Continue to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
