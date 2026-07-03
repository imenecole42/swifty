import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

function pickCursus(cursusUsers) {
  if (!cursusUsers || cursusUsers.length === 0) return null;
  const main = cursusUsers.find((c) => c.cursus_id === 21);
  return main || cursusUsers[cursusUsers.length - 1];
}

function SkillBar({ name, level, percentage }) {
  return (
    <View style={styles.skillRow}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName} numberOfLines={1}>{name}</Text>
        <Text style={styles.skillLevel}>lvl {level.toFixed(2)}</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%` }]} />
      </View>
      <Text style={styles.skillPct}>{percentage.toFixed(0)}%</Text>
    </View>
  );
}

function ProjectItem({ project }) {
  const status = project['final_mark'] !== null
    ? project['validated?']
      ? 'validated'
      : 'failed'
    : 'in_progress';

  const colors = {
    validated: '#2ecc71',
    failed: '#e74c3c',
    in_progress: '#f39c12',
  };

  const labels = {
    validated: 'Validé',
    failed: 'Échoué',
    in_progress: 'En cours',
  };

  return (
    <View style={styles.projectRow}>
      <View style={[styles.projectDot, { backgroundColor: colors[status] }]} />
      <Text style={styles.projectName} numberOfLines={1} ellipsizeMode="tail">
        {project.project.name}
      </Text>
      <Text style={[styles.projectStatus, { color: colors[status] }]}>
        {project['final_mark'] !== null ? `${project['final_mark']} — ` : ''}
        {labels[status]}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen({ route, navigation }) {
  const { user } = route.params;
  const cursus = pickCursus(user.cursus_users);
  const skills = cursus?.skills || [];
  const projects = (user.projects_users || []).filter(
    (p) => p['final_mark'] !== null || p.status === 'in_progress'
  );

  const imageUrl =
    user.image?.versions?.medium ||
    user.image?.link ||
    null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* En-tête profil */}
      <View style={styles.header}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{user.login[0].toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.login}>{user.login}</Text>
        {user.displayname ? (
          <Text style={styles.fullname}>{user.displayname}</Text>
        ) : null}

        {cursus && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Niveau {cursus.level.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.card}>
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Mobile" value={user.phone && user.phone !== 'hidden' ? user.phone : null} />
          <InfoRow label="Localisation" value={user.location || 'Hors campus'} />
          <InfoRow label="Wallet" value={`${user.wallet} ₳`} />
          <InfoRow label="Points de correction" value={user.correction_point} />
          <InfoRow label="Campus" value={user.campus?.[0]?.name} />
        </View>
      </View>

      {/* Skills */}
      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences</Text>
          <View style={styles.card}>
            {skills.map((s) => (
              <SkillBar
                key={s.id}
                name={s.name}
                level={s.level}
                percentage={s.percentage ?? (s.level % 1) * 100}
              />
            ))}
          </View>
        </View>
      )}

      {/* Projets */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projets</Text>
          <View style={styles.card}>
            {projects.map((p) => (
              <ProjectItem key={p.id} project={p} />
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Nouvelle recherche</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#00babc',
  },
  avatarPlaceholder: {
    backgroundColor: '#1c1c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    color: '#00babc',
    fontWeight: '700',
  },
  login: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  fullname: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 4,
  },
  levelBadge: {
    marginTop: 10,
    backgroundColor: '#00babc22',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#00babc',
  },
  levelText: {
    color: '#00babc',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00babc',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1c1c2e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  skillRow: {
    marginBottom: 14,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    color: '#ddd',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  skillLevel: {
    color: '#00babc',
    fontSize: 12,
    fontWeight: '600',
  },
  barBg: {
    height: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00babc',
    borderRadius: 3,
  },
  skillPct: {
    color: '#888',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'right',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    flexShrink: 0,
  },
  projectName: {
    flex: 1,
    color: '#ddd',
    fontSize: 13,
  },
  projectStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 0,
  },
  backBtn: {
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginTop: 8,
  },
  backBtnText: {
    color: '#00babc',
    fontWeight: '700',
    fontSize: 15,
  },
});
