import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select, DatePicker, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningService from "../../Services/LearningService";

const { Option } = Select;
const { TextArea } = Input;

const CreateLearningModal = ({ onRefresh }) => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("general");

  useEffect(() => {
    if (snap.createLearningModalOpened) {
      form.resetFields();
      setTemplate("general");
    }
  }, [snap.createLearningModalOpened, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (values.dateObtained) {
        values.dateObtained = values.dateObtained.format("YYYY-MM-DD");
      }

      const body = {
        ...values,
        userId: snap.currentUser?.uid,
        template: template,
        timestamp: new Date().toISOString(),
      };

      const tempId = `temp-${Date.now()}`;
      const tempLearning = { ...body, id: tempId };

      state.learningEntries = [tempLearning, ...(state.learningEntries || [])];

      const newLearning = await LearningService.createLearning(body);

      state.learningEntries = state.learningEntries.map((entry) =>
        entry.id === tempId ? newLearning : entry
      );

      message.success("Learning entry created successfully");
      form.resetFields();
      state.createLearningModalOpened = false;
      if (onRefresh) onRefresh();
    } catch (error) {
      state.learningEntries = (state.learningEntries || []).filter(
        (entry) => !entry.id.startsWith("temp-")
      );
      console.error("Failed to create learning entry:", error);
      message.error("Failed to create learning entry");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (value) => {
    setTemplate(value);
    form.resetFields([
      "projectName",
      "projectLink",
      "certificationName",
      "provider",
      "dateObtained",
      "challengeName",
      "result",
      "workshopName",
      "duration",
    ]);
  };

  const renderTemplateFields = () => {
    switch (template) {
      case "project":
        return (
          <>
            <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
              <Input placeholder="Enter project name" className="rounded-md" />
            </Form.Item>
            <Form.Item name="projectLink" label="Project Link">
              <Input placeholder="Enter project link (optional)" className="rounded-md" />
            </Form.Item>
          </>
        );
      case "certification":
        return (
          <>
            <Form.Item name="certificationName" label="Certification Name" rules={[{ required: true }]}>
              <Input placeholder="Enter certification name" className="rounded-md" />
            </Form.Item>
            <Form.Item name="provider" label="Provider" rules={[{ required: true }]}>
              <Input placeholder="Enter provider" className="rounded-md" />
            </Form.Item>
            <Form.Item name="dateObtained" label="Date Obtained" rules={[{ required: true }]}>
              <DatePicker className="w-full rounded-md" />
            </Form.Item>
          </>
        );
      case "challenge":
        return (
          <>
            <Form.Item name="challengeName" label="Challenge Name" rules={[{ required: true }]}>
              <Input placeholder="Enter challenge name" className="rounded-md" />
            </Form.Item>
            <Form.Item name="result" label="Result" rules={[{ required: true }]}>
              <Input placeholder="Enter result" className="rounded-md" />
            </Form.Item>
          </>
        );
      case "workshop":
        return (
          <>
            <Form.Item name="workshopName" label="Workshop Name" rules={[{ required: true }]}>
              <Input placeholder="Enter workshop name" className="rounded-md" />
            </Form.Item>
            <Form.Item name="provider" label="Provider" rules={[{ required: true }]}>
              <Input placeholder="Enter provider" className="rounded-md" />
            </Form.Item>
            <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
              <Input placeholder="Enter duration" className="rounded-md" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  const closeModal = () => {
    form.resetFields();
    state.createLearningModalOpened = false;
  };

  return (
    <Modal
      open={snap.createLearningModalOpened}
      onCancel={closeModal}
      footer={null}
      destroyOnClose
      className="rounded-2xl"
      title={
        <div className="text-xl font-semibold text-teal-700 text-center">Track Learning Progress</div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-2">
        <Form.Item name="template" label="Learning Type" initialValue="general" rules={[{ required: true }]}>
          <Select onChange={handleTemplateChange} className="rounded-md">
            <Option value="general">General Learning</Option>
            <Option value="project">Completed Project/Task</Option>
            <Option value="certification">Certification/Qualification</Option>
            <Option value="challenge">Challenges/Competitions</Option>
            <Option value="workshop">Workshops/Bootcamps</Option>
          </Select>
        </Form.Item>

        <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
          <Input placeholder="What did you learn?" className="rounded-md" />
        </Form.Item>

        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <TextArea rows={4} placeholder="Describe what you learned..." className="rounded-md" />
        </Form.Item>

        <Form.Item name="resourceLink" label="Resource Link">
          <Input placeholder="Link to resource (optional)" className="rounded-md" />
        </Form.Item>

        <Form.Item name="status" label="Status" initialValue="In Progress" rules={[{ required: true }]}>
          <Select className="rounded-md">
            <Option value="In Progress">In Progress</Option>
            <Option value="Completed">Completed</Option>
            <Option value="On Hold">On Hold</Option>
            <Option value="Planned">Planned</Option>
          </Select>
        </Form.Item>

        {renderTemplateFields()}

        <Form.Item name="nextSteps" label="Next Steps">
          <TextArea rows={3} placeholder="What are your next steps?" className="rounded-md" />
        </Form.Item>

        <Form.Item name="reflection" label="Reflection">
          <TextArea rows={3} placeholder="Reflect on what you've learned..." className="rounded-md" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold"
          >
            Save Learning Entry
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateLearningModal;
