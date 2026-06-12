{{- define "hayden-portfolio.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "hayden-portfolio.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "hayden-portfolio.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "hayden-portfolio.labels" -}}
app.kubernetes.io/name: {{ include "hayden-portfolio.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{- define "hayden-portfolio.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hayden-portfolio.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
