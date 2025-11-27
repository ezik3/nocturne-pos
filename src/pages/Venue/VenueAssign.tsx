import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search } from "lucide-react";

const employees = [
  { id: "1", name: "John Doe", avatar: "", role: "Server" },
  { id: "2", name: "Jane Smith", avatar: "", role: "Bartender" },
  { id: "3", name: "Mike Johnson", avatar: "", role: "Kitchen" },
  { id: "4", name: "Sarah Wilson", avatar: "", role: "Server" },
];

const stations = [
  { id: "table1", name: "Table 1", type: "Serving", assignedTo: null },
  { id: "table2", name: "Table 2", type: "Serving", assignedTo: null },
  { id: "bar1", name: "Bar 1", type: "Bar", assignedTo: null },
  { id: "kitchen", name: "Kitchen", type: "Kitchen", assignedTo: null },
];

const filterTabs = ["All", "Serving", "Registry", "Bar", "Kitchen"];

export default function VenueAssign() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary mb-6">Assign Employees</h1>

      <div className="flex items-center justify-between mb-6">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Employee
        </Button>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          Create Roster
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee List */}
        <Card className="glass border-border">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/30 border-border"
              />
            </div>
            
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-grab hover:bg-secondary/50 transition-colors"
                  draggable
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stations Grid */}
        <Card className="glass border-border">
          <CardContent className="p-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {filterTabs.map((tab) => (
                <Button
                  key={tab}
                  variant={activeFilter === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(tab)}
                  className={activeFilter === tab 
                    ? "bg-primary text-primary-foreground" 
                    : "border-border text-muted-foreground hover:text-foreground"
                  }
                >
                  {tab}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="border-border">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Stations */}
            <div className="grid grid-cols-2 gap-4">
              {stations
                .filter(s => activeFilter === "All" || s.type === activeFilter)
                .map((station) => (
                  <div
                    key={station.id}
                    className="p-6 rounded-lg border-2 border-dashed border-border bg-secondary/20 text-center hover:border-primary/50 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-primary mb-2">{station.name}</h3>
                    <p className="text-sm text-muted-foreground">Drop employee here</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
