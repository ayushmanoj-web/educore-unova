import WhatsAppChat from "@/components/WhatsAppChat";
import { useNavigate } from "react-router-dom";

const WhatsAppChatPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <WhatsAppChat 
      onBack={handleBack}
      contactName="Study Group Chat"
      contactImage="/placeholder.svg"
    />
  );
};

export default WhatsAppChatPage;