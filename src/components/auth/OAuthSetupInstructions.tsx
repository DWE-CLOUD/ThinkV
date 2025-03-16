import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, FileCode, CheckSquare } from 'lucide-react';

const OAuthSetupInstructions: React.FC = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="p-6 overflow-y-auto max-h-[70vh]">
      <motion.div variants={itemVariants} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-coffee-800 mb-2">Configure OAuth Providers in Supabase</h3>
          <p className="text-coffee-600">
            You're seeing this message because OAuth providers haven't been configured in your Supabase project.
            Follow these steps to enable social logins:
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="bg-beige-100 p-4 rounded-lg border border-beige-200"
          >
            <h4 className="font-medium text-coffee-800 flex items-center mb-2">
              <span className="bg-coffee-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">1</span>
              Access your Supabase Dashboard
            </h4>
            <p className="text-coffee-600 mb-3">
              Log in to your Supabase dashboard and select the project you're using for this application.
            </p>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-coffee-700 hover:text-coffee-900 font-medium"
            >
              Go to Supabase Dashboard
              <ExternalLink size={16} className="ml-1" />
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-beige-100 p-4 rounded-lg border border-beige-200"
          >
            <h4 className="font-medium text-coffee-800 flex items-center mb-2">
              <span className="bg-coffee-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">2</span>
              Navigate to Authentication Settings
            </h4>
            <p className="text-coffee-600 mb-1">
              In the left sidebar menu:
            </p>
            <ol className="list-decimal ml-6 space-y-1 text-coffee-600 mb-3">
              <li>Click on <span className="font-medium">Authentication</span></li>
              <li>Then select <span className="font-medium">Providers</span></li>
            </ol>
            <div className="mb-3">
              <img 
                src="https://supabase.com/images/docs/auth-providers.png" 
                alt="Supabase Authentication Providers Menu" 
                className="rounded-md border border-beige-300 shadow-sm"
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-beige-100 p-4 rounded-lg border border-beige-200"
          >
            <h4 className="font-medium text-coffee-800 flex items-center mb-2">
              <span className="bg-coffee-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">3</span>
              Configure OAuth Providers
            </h4>
            
            <div className="space-y-5">
              {/* Google Provider */}
              <div className="border-b border-beige-200 pb-4">
                <h5 className="font-medium text-coffee-700 flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Google
                </h5>
                <ol className="list-decimal ml-6 space-y-1 text-coffee-600">
                  <li>Enable the Google provider toggle</li>
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-coffee-700 hover:text-coffee-900 underline">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Navigate to "APIs & Services" {'>'} "Credentials"</li>
                  <li>Click "Create Credentials" {'>'} "OAuth client ID"</li>
                  <li>Set application type to "Web application"</li>
                  <li>Add authorized redirect URI: <code className="bg-beige-200 px-1 py-0.5 rounded text-sm">{window.location.origin}/auth/v1/callback</code></li>
                  <li>Copy the Client ID and Client Secret back to Supabase</li>
                </ol>
              </div>

              {/* GitHub Provider */}
              <div className="border-b border-beige-200 pb-4">
                <h5 className="font-medium text-coffee-700 flex items-center mb-2">
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </h5>
                <ol className="list-decimal ml-6 space-y-1 text-coffee-600">
                  <li>Enable the GitHub provider toggle</li>
                  <li>Go to <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-coffee-700 hover:text-coffee-900 underline">GitHub Developer Settings</a></li>
                  <li>Click "New OAuth App"</li>
                  <li>Fill in the application details</li>
                  <li>Add callback URL: <code className="bg-beige-200 px-1 py-0.5 rounded text-sm">{window.location.origin}/auth/v1/callback</code></li>
                  <li>Register the application</li>
                  <li>Copy the Client ID and generate a Client Secret</li>
                  <li>Paste these values back in Supabase</li>
                </ol>
              </div>

              {/* Discord Provider */}
              <div>
                <h5 className="font-medium text-coffee-700 flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
                    />
                  </svg>
                  Discord
                </h5>
                <ol className="list-decimal ml-6 space-y-1 text-coffee-600">
                  <li>Enable the Discord provider toggle</li>
                  <li>Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-coffee-700 hover:text-coffee-900 underline">Discord Developer Portal</a></li>
                  <li>Click "New Application"</li>
                  <li>Fill in the application details</li>
                  <li>Navigate to "OAuth2" in the sidebar</li>
                  <li>Add redirect URL: <code className="bg-beige-200 px-1 py-0.5 rounded text-sm">{window.location.origin}/auth/v1/callback</code></li>
                  <li>Copy the Client ID and Client Secret</li>
                  <li>Paste these values back in Supabase</li>
                </ol>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-beige-100 p-4 rounded-lg border border-beige-200"
          >
            <h4 className="font-medium text-coffee-800 flex items-center mb-2">
              <span className="bg-coffee-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">4</span>
              Update Site URL and Redirect URLs
            </h4>
            <p className="text-coffee-600 mb-3">
              Make sure your Site URL and Redirect URLs are properly configured:
            </p>
            <ol className="list-decimal ml-6 space-y-1 text-coffee-600">
              <li>In Supabase, go to Authentication {'>'} URL Configuration</li>
              <li>Set Site URL to: <code className="bg-beige-200 px-1 py-0.5 rounded text-sm">{window.location.origin}</code></li>
              <li>Add Redirect URLs:
                <ul className="list-disc ml-6 mt-1">
                  <li><code className="bg-beige-200 px-1 py-0.5 rounded text-sm">{window.location.origin}/dashboard</code></li>
                  <li><code className="bg-beige-200 px-1 py-0.5 rounded text-sm">{window.location.origin}</code></li>
                </ul>
              </li>
            </ol>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-beige-100 p-4 rounded-lg border border-beige-200"
          >
            <h4 className="font-medium text-coffee-800 flex items-center mb-2">
              <span className="bg-coffee-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">5</span>
              Test the OAuth Configuration
            </h4>
            <p className="text-coffee-600 mb-3">
              After setting up the providers, return to the application and try signing in with the configured providers.
            </p>
            <div className="bg-coffee-700 text-beige-50 p-3 rounded-md">
              <div className="font-medium mb-1 flex items-center">
                <CheckSquare size={18} className="mr-1" />
                Important Notes
              </div>
              <ul className="list-disc ml-5 text-sm space-y-1">
                <li>It may take a few minutes for changes to take effect after saving provider settings</li>
                <li>Make sure to reload this application after configuring providers</li>
                <li>Double-check redirect URLs if you encounter "Callback URL mismatch" errors</li>
                <li>For local development, some providers may require additional steps for non-HTTPS URLs</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-beige-100 p-4 rounded-lg border border-beige-200"
          >
            <h4 className="font-medium text-coffee-800 flex items-center mb-2">
              <span className="bg-coffee-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">6</span>
              Additional Resources
            </h4>
            <ul className="space-y-2 text-coffee-600">
              <li className="flex items-center">
                <FileCode size={16} className="mr-2 text-coffee-700" />
                <a 
                  href="https://supabase.com/docs/guides/auth/social-login" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-coffee-700 hover:text-coffee-900 underline"
                >
                  Supabase Social Login Documentation
                </a>
              </li>
              <li className="flex items-center">
                <Github size={16} className="mr-2 text-coffee-700" />
                <a 
                  href="https://github.com/supabase/auth-helpers" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-coffee-700 hover:text-coffee-900 underline"
                >
                  Supabase Auth Helpers Repository
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthSetupInstructions;