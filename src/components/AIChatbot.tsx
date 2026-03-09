import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Saurashtra Cycle Hub assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const predefinedResponses: Record<string, string> = {
    'hello': 'Hello! Welcome to Saurashtra Cycle Hub. How can I assist you with managing your cycle shop today?',
    'hi': 'Hi there! Need help with inventory, sales, or reports? I\'m here to help!',
    'help': 'I can help you with: inventory management, sales processes, user roles, reports, and general system navigation.',
    'inventory': 'Our inventory management system allows you to track cycles, accessories, and spare parts. You can add, update, or remove items, and monitor stock levels in real-time.',
    'sales': 'The sales module helps you process transactions, track orders, and manage customer information. You can generate invoices and view sales history.',
    'reports': 'Generate comprehensive sales reports, inventory reports, and performance analytics to make informed business decisions.',
    'users': 'Manage user accounts with different roles: Super Admin, Admin, Employee, and Customer. Each role has specific permissions.',
    'dashboard': 'The dashboard provides an overview of your business with key metrics, recent activities, and quick access to important functions.',
    'login': 'To log in, use your registered credentials. Different user roles have different access levels in the system.',
    'logout': 'To log out, click on your profile icon in the top right corner and select "Logout".',
    'profile': 'Manage your profile information in the settings section. Admins can manage user profiles and permissions.',
    'orders': 'Track orders from creation to completion. View order status, customer details, and order history.',
    'products': 'Manage your product catalog with categories, pricing, and availability status.',
    'settings': 'Access system settings to configure preferences, manage user roles, and customize the system.',
    'support': 'For technical support, contact your system administrator or refer to the help documentation.',
    'thank you': 'You\'re welcome! Feel free to ask if you have more questions.',
    'thanks': 'You\'re welcome! Is there anything else I can help you with?'
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase().trim();
    
    // Check for predefined responses
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }

    // Default responses for common queries
    if (lowerInput.includes('how') && lowerInput.includes('work')) {
      return 'The Saurashtra Cycle Hub system helps you manage your cycle shop efficiently. You can track inventory, process sales, manage customers, and generate reports. Which specific area would you like to know more about?';
    }

    if (lowerInput.includes('cycle') || lowerInput.includes('bicycle')) {
      return 'Our system helps you manage all types of cycles and bicycles. You can track inventory levels, pricing, and customer orders for different cycle models.';
    }

    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return 'You can set and update prices for cycles and accessories in the inventory management section. Price changes are reflected immediately across the system.';
    }

    if (lowerInput.includes('stock') || lowerInput.includes('available')) {
      return 'Check real-time stock levels in the inventory dashboard. Get alerts when stock levels are low to ensure you never run out of popular items.';
    }

    if (lowerInput.includes('service') || lowerInput.includes('repair')) {
      return 'Track service jobs and repairs in the service management module. Schedule appointments, track progress, and manage customer service history.';
    }

    // Default response
    return 'I\'m here to help with questions about the Saurashtra Cycle Hub system. You can ask me about inventory, sales, reports, user management, or any other feature. How can I assist you?';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-28 rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-[60] bg-blue-600 hover:bg-blue-700"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-28 w-96 h-[500px] z-[60]">
          <Card className="h-full flex flex-col border rounded-lg shadow-xl">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg p-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Cycle Hub Assistant
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-col h-[calc(100%-4rem)] p-0">
              <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[80%] ${
                          message.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 rounded-full items-center justify-center ${
                            message.sender === 'user'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <div className="flex h-8 w-8 rounded-full items-center justify-center bg-green-100 text-green-800">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t p-4 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Cycle Hub..."
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIChatbot;