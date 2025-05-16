// LearningDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningService from "../../Services/LearningService";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
  ExperimentOutlined,
  TeamOutlined,
  PlusOutlined
} from "@ant-design/icons";
import CreateLearningModal from "../Modals/CreateLearningModal";
import LearningDetailsModal from "../Modals/LearningDetailsModal";

const LearningDashboard = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    onHold: 0,
    planned: 0,
    recent: 0,
    byTemplate: {}
  });

  const loadUserLearning = async () => {
    if (!snap.currentUser?.uid) return;
    try {
      setLoading(true);
      const userLearning = await LearningService.getLearningByUserId(
        snap.currentUser.uid
      );
      userLearning.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      state.learningEntries = userLearning;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const templateCounts = {};
      const completed = userLearning.filter(e => e.status === "Completed").length;
      const inProgress = userLearning.filter(e => e.status === "In Progress").length;
      const onHold = userLearning.filter(e => e.status === "On Hold").length;
      const planned = userLearning.filter(e => e.status === "Planned").length;
      const recent = userLearning.filter(e => new Date(e.timestamp) > oneWeekAgo).length;
      userLearning.forEach(e => {
        const template = e.template || "general";
        templateCounts[template] = (templateCounts[template] || 0) + 1;
      });
      setStats({
        total: userLearning.length,
        completed,
        inProgress,
        onHold,
        planned,
        recent,
        byTemplate: templateCounts
      });
    } catch (err) {
      console.error("Failed to fetch learning entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserLearning();
  }, [snap.currentUser?.uid]);

  const handleViewDetails = (learning) => {
    state.selectedLearning = learning;
    state.learningDetailsModalOpened = true;
  };

  const getStatusTag = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    switch (status) {
      case "Completed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircleOutlined className="mr-1" />
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <ClockCircleOutlined className="mr-1" />
            In Progress
          </span>
        );
      case "On Hold":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <PauseCircleOutlined className="mr-1" />
            On Hold
          </span>
        );
      case "Planned":
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <CalendarOutlined className="mr-1" />
            Planned
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const getTemplateIcon = (template) => {
    const iconClass = "text-lg mr-2";
    switch (template) {
      case "project":
        return <ExperimentOutlined className={iconClass} />;
      case "certification":
        return <TrophyOutlined className={iconClass} />;
      case "challenge":
        return <ExperimentOutlined className={iconClass} />;
      case "workshop":
        return <TeamOutlined className={iconClass} />;
      default:
        return <BookOutlined className={iconClass} />;
    }
  };

  const getTemplateLabel = (template) => {
    switch (template) {
      case "project":
        return "Project";
      case "certification":
        return "Certification";
      case "challenge":
        return "Challenge";
      case "workshop":
        return "Workshop";
      default:
        return "General";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const renderLearningCard = (learning) => (
    <div
      key={learning.id}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => handleViewDetails(learning)}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getTemplateIcon(learning.template)}
            <h3 className="font-medium text-gray-900">{learning.topic}</h3>
          </div>
          {getStatusTag(learning.status)}
        </div>
      </div>
      <div className="p-4">
        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mb-2">
          {getTemplateLabel(learning.template)}
        </span>
        <p className="text-gray-600 mb-4 line-clamp-2">{learning.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDate(learning.timestamp)}</span>
          <button
            className="text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(learning);
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return snap.learningEntries?.length > 0 ? (
          snap.learningEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No learning entries found</p>
          </div>
        );
      case "recent":
        const recentEntries = snap.learningEntries?.filter(
          entry => new Date(entry.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        return recentEntries?.length > 0 ? (
          recentEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No recent learning entries</p>
          </div>
        );
      case "inProgress":
        const inProgressEntries = snap.learningEntries?.filter(
          entry => entry.status === "In Progress"
        );
        return inProgressEntries?.length > 0 ? (
          inProgressEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No in-progress entries found</p>
          </div>
        );
      case "onHold":
        const onHoldEntries = snap.learningEntries?.filter(
          entry => entry.status === "On Hold"
        );
        return onHoldEntries?.length > 0 ? (
          onHoldEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No on-hold entries found</p>
          </div>
        );
      case "planned":
        const plannedEntries = snap.learningEntries?.filter(
          entry => entry.status === "Planned"
        );
        return plannedEntries?.length > 0 ? (
          plannedEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No planned entries found</p>
          </div>
        );
      case "projects":
        const projectEntries = snap.learningEntries?.filter(
          entry => entry.template === "project"
        );
        return projectEntries?.length > 0 ? (
          projectEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No project entries found</p>
          </div>
        );
      case "certifications":
        const certificationEntries = snap.learningEntries?.filter(
          entry => entry.template === "certification"
        );
        return certificationEntries?.length > 0 ? (
          certificationEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No certification entries found</p>
          </div>
        );
      case "challenges":
        const challengeEntries = snap.learningEntries?.filter(
          entry => entry.template === "challenge"
        );
        return challengeEntries?.length > 0 ? (
          challengeEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No challenge entries found</p>
          </div>
        );
      case "workshops":
        const workshopEntries = snap.learningEntries?.filter(
          entry => entry.template === "workshop"
        );
        return workshopEntries?.length > 0 ? (
          workshopEntries.map(renderLearningCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No workshop entries found</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Learning Dashboard</h2>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          onClick={() => {
            state.createLearningModalOpened = true;
          }}
        >
          <PlusOutlined className="mr-2" />
          Add Learning
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <BookOutlined className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Entries</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleOutlined className="text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-semibold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xl font-semibold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <PauseCircleOutlined className="text-yellow-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">On Hold</p>
              <p className="text-xl font-semibold text-yellow-600">{stats.onHold}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarOutlined className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Planned</p>
              <p className="text-xl font-semibold text-gray-600">{stats.planned}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarOutlined className="text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-xl font-semibold text-purple-600">{stats.recent}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {[
              { key: "all", label: "All Learning" },
              { key: "recent", label: "Recent" },
              { key: "inProgress", label: "In Progress" },
              { key: "onHold", label: "On Hold" },
              { key: "planned", label: "Planned" },
              { key: "projects", label: "Projects" },
              { key: "certifications", label: "Certifications" },
              { key: "challenges", label: "Challenges" },
              { key: "workshops", label: "Workshops" }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderTabContent()}
          </div>
        </div>
      </div>

      <CreateLearningModal onRefresh={loadUserLearning} />
      <LearningDetailsModal onRefresh={loadUserLearning} />
    </div>
  );
};

export default LearningDashboard;