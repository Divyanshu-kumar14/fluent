/**
 * App Form Hook
 *
 * Creates a shared TanStack Form context and hook using createFormHook.
 * This centralises form configuration so all forms in the app share the
 * same context and can access field/form state via useFieldContext / useFormContext.
 */
"use client";

import { 
    createFormHookContexts,
    createFormHook
 } from "@tanstack/react-form"

/** Shared form/field contexts — used by useTypedAppFormContext in child components. */
export const {
    fieldContext,
    formContext,
    useFieldContext,
    useFormContext
} = createFormHookContexts();

/** App-level form hook — wraps createFormHook with shared contexts. */
export const {
    useAppForm,
    useTypedAppFormContext,
} = createFormHook({
    fieldComponents: {},
    formComponents: {},
    fieldContext,
    formContext,
});