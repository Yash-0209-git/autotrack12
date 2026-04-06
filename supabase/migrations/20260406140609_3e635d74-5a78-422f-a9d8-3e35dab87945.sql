
-- Staff can update customers
CREATE POLICY "Staff update customers"
ON public.customers FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'staff'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'staff'::user_role));

-- Staff can delete customers
CREATE POLICY "Staff delete customers"
ON public.customers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'staff'::user_role));

-- Staff can update vehicles
CREATE POLICY "Staff update vehicles"
ON public.vehicles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'staff'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'staff'::user_role));

-- Staff can delete vehicles
CREATE POLICY "Staff delete vehicles"
ON public.vehicles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'staff'::user_role));

-- Lock down user_roles: only the handle_new_user trigger (SECURITY DEFINER) and admins can insert
-- Drop the existing admin ALL policy and recreate with proper TO clause
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));
