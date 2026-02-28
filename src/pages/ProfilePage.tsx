import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, KeyRound } from "lucide-react";

const currentUser = {
  name: "Sarah Chen",
  email: "s.chen@firm.com",
  role: "master" as const,
};

const ProfilePage = () => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    toast({ title: "Profile saved", description: "Your changes have been saved." });
  };

  const handleResetPassword = () => {
    setResetOpen(false);
    toast({ title: "Password reset sent", description: "Check your email for reset instructions." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile picture" />}
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4 mr-1.5" /> Upload picture
              </Button>
              <p className="text-xs text-muted-foreground">JPG or PNG, max 2 MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <Separator />

          {/* Form fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={email} readOnly className="bg-muted/50 cursor-not-allowed" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Role</Label>
            <Badge variant={currentUser.role === "master" ? "default" : "secondary"}>
              {currentUser.role === "master" ? "Master" : "Collaborator"}
            </Badge>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Send a password reset link to your email</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
              <KeyRound className="h-4 w-4 mr-1.5" /> Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset confirmation dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>A reset link will be sent to {email}. Continue?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword}>Send Reset Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
